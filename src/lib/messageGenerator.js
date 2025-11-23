export function generateSmartMessage(c) {
  const name = c.name.split(" ")[0];

  // Determine message tone
  let tone = "friendly";

  if (c.totalRevenue > 8000) tone = "premium";
  else if (c.totalVisits > 6) tone = "warm";
  else if (c.daysOverdue > 70) tone = "encouraging";

  const templates = {
    friendly: [
      `Hi ${name}! Hope you're doing great 😊 Just a reminder that your ${c.serviceType} is due. Want me to book a slot for you?`,
      `${name}, your ${c.serviceType} is ready for its routine refresh. Shall I schedule it for you? 🙂`
    ],
    warm: [
      `Hey ${name}, your regular ${c.serviceType} time has come again 💆‍♀️ Shall I reserve a comfortable slot?`,
      `${name}, we’d love to see you back again for your ${c.serviceType}. Want me to schedule it?`
    ],
    premium: [
      `Hello ${name}, your premium ${c.serviceType} session is ideally due now. I can secure your best available slot. Shall I proceed? ✨`,
      `${name}, you are eligible for priority booking on your ${c.serviceType}. Would you like me to arrange a premium slot?`
    ],
    encouraging: [
      `Hi ${name}, your ${c.serviceType} is overdue. Want me to arrange a quick session for you? I’ll get you the best timing 🙂`,
      `${name}, let's get your ${c.serviceType} back on track. Shall I reserve a good slot for you?`
    ]
  };

  const arr = templates[tone];
  return arr[Math.floor(Math.random() * arr.length)];
}
