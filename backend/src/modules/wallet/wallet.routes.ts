import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { 
    createDepositRequest, 
    listMyDeposits, 
    getDepositAddresses, 
    getMyWalletAddresses, 
    upsertMyWalletAddresses, 
} from "./wallet.controller";
import { listMyTransactions } from "./wallet.controller";



const router = Router();

// ...existing routes...

router.get("/deposits/my", requireAuth, listMyDeposits);
router.post("/deposits", requireAuth, createDepositRequest);
router.get("/deposit-addresses", requireAuth, getDepositAddresses);

// ✅ user withdrawal wallets
router.get("/me/wallet-addresses", requireAuth, getMyWalletAddresses);
router.put("/me/wallet-addresses", requireAuth, upsertMyWalletAddresses);

// ✅ aliases (your frontend uses /api/wallet/addresses)
router.get("/addresses", requireAuth, getMyWalletAddresses);
router.put("/addresses", requireAuth, upsertMyWalletAddresses);

router.get("/transactions/my", requireAuth, listMyTransactions);



export default router;
