type LeaderboardRow = {
  id: string;
  name: string;
  totalEarningsCents: number;
};

export default function ReferralLeaderboard({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-bgAlt p-4 text-sm">
      <h3 className="font-semibold mb-3">Top Referrers</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 border-b border-gray-800">
              <th className="py-2 text-left">Rank</th>
              <th className="py-2 text-left">User</th>
              <th className="py-2 text-right">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id} className="border-b border-gray-900">
                <td className="py-2">{idx + 1}</td>
                <td className="py-2">{row.name}</td>
                <td className="py-2 text-right text-accentGreen">
                  ${(row.totalEarningsCents / 100).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
