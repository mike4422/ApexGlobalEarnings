type ReferralOverviewProps = {
  referralCode: string;
  totalEarningsCents: number;
  totalReferrals: number;
};

export default function ReferralOverview({
  referralCode,
  totalEarningsCents,
  totalReferrals,
}: ReferralOverviewProps) {
  const earnings = (totalEarningsCents / 100).toFixed(2);
  const link = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/register?ref=${referralCode}`;

  return (
    <div className="rounded-2xl border border-gray-800 bg-bgAlt p-4 space-y-3 text-sm">
      <h3 className="font-semibold">Referral Program</h3>
      <div className="grid gap-4 sm:grid-cols-3 text-xs">
        <div>
          <p className="text-gray-400 mb-1">Referral Code</p>
          <p className="font-mono text-accentGold">{referralCode}</p>
        </div>
        <div>
          <p className="text-gray-400 mb-1">Total Earnings</p>
          <p className="font-semibold text-accentGreen">${earnings}</p>
        </div>
        <div>
          <p className="text-gray-400 mb-1">Total Referrals</p>
          <p className="font-semibold">{totalReferrals}</p>
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-xs mb-1">Your Referral Link</p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            className="flex-1 rounded-md bg-black/60 border border-gray-700 px-2 py-1 text-[11px]"
            value={link}
          />
        </div>
      </div>
      <p className="text-[11px] text-gray-500">
        Earn Level 1 & Level 2 commissions automatically when your network invests.
      </p>
    </div>
  );
}
