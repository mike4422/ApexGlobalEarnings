type WalletSummaryProps = {
  balanceCents: number;
};

export default function WalletSummary({ balanceCents }: WalletSummaryProps) {
  const balance = (balanceCents / 100).toFixed(2);
  return (
    <div className="rounded-2xl border border-gray-800 bg-bgAlt p-4 flex flex-col gap-2">
      <p className="text-xs text-gray-400">Available Balance</p>
      <p className="text-2xl font-semibold text-accentGreen">${balance}</p>
      <p className="text-[11px] text-gray-500">
        Use your balance to fund new investments or request withdrawals.
      </p>
    </div>
  );
}
