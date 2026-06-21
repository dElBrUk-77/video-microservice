const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { pool } = require('../db');

// Endpoint para iniciar Checkout
const createCheckoutSession = async (req, res) => {
  try {
    const { companyId, planPriceId } = req.body; // El cliente debe enviar qué quiere pagar
    const userId = req.user.id; // Del middleware de autenticación

    // 1. Obtener el stripe_account_id de la empresa creadora
    const companyResult = await pool.query('SELECT stripe_account_id FROM companies WHERE id = $1', [companyId]);
    if (companyResult.rows.length === 0 || !companyResult.rows[0].stripe_account_id) {
      return res.status(400).json({ error: 'El creador no tiene configurado Stripe Connect.' });
    }
    const stripeAccountId = companyResult.rows[0].stripe_account_id;

    // 2. Obtener el email del usuario para Stripe
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
    const userEmail = userResult.rows[0].email;

    // 3. Crear sesión de Stripe enrutando el dinero a la cuenta conectada (B2B2C)
    // Usamos payment_intent_data.transfer_data para cobrar comisión (ej: 10% para tu plataforma)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail,
      client_reference_id: userId.toString(),
      line_items: [{
        price: planPriceId,
        quantity: 1,
      }],
      mode: 'subscription', // O 'payment' si es pago único
      payment_intent_data: {
        transfer_data: {
          destination: stripeAccountId,
        },
        // application_fee_amount: 500, // Descomentar para cobrar 5.00$ de comisión por transacción
      },
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error.message);
    res.status(500).json({ error: 'Error al generar la pasarela de pago.' });
  }
};

// Endpoint seguro para el Webhook (Validado por HACKERITO)
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    // HACKERITO Rule: Validar siempre la firma para evitar pagos falsos inyectados
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Si el pago es exitoso, activamos la membresía
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;

    if (userId) {
      await pool.query('UPDATE users SET membership_active = true WHERE id = $1', [userId]);
      console.log(`✅ Membresía activada para el usuario ${userId}`);
    }
  }

  res.status(200).send();
};

module.exports = { createCheckoutSession, stripeWebhook };
