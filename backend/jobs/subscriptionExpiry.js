const cron = require('node-cron');
const { supabase } = require('../db');

/**
 * Runs every day at midnight (00:00).
 * Finds all users whose subscription window (last_paid_date + 3 months)
 * has elapsed and flips is_paid → false in bulk.
 */
const startSubscriptionExpiryJob = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running subscription expiry cleanup...');

    try {
      // Calculate the cutoff: 3 months ago from now
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - 3);

      const { data, error } = await supabase
        .from('user_applications')
        .update({
          is_paid: false,
          updated_at: new Date().toISOString(),
        })
        .eq('is_paid', true)
        .lt('last_paid_date', cutoffDate.toISOString())
        .select('user_id, email');

      if (error) {
        console.error('[Cron] Subscription expiry error:', error.message);
        return;
      }

      const expiredCount = data?.length ?? 0;
      if (expiredCount > 0) {
        console.log(`[Cron] Expired ${expiredCount} subscription(s):`, data.map(u => u.email).join(', '));
      } else {
        console.log('[Cron] No subscriptions to expire today.');
      }
    } catch (err) {
      console.error('[Cron] Unexpected error:', err.message);
    }
  });

  console.log('[Cron] Subscription expiry job scheduled (daily at 00:00).');
};

module.exports = { startSubscriptionExpiryJob };
