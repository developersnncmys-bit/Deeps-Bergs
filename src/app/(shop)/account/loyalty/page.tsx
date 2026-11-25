import { LoyaltyPanel } from "@/components/account/LoyaltyPanel";
import {
  loyaltyLedger,
  pointsBalance,
  referral,
  POINT_VALUE_INR,
} from "@/lib/mock-data/loyalty";

export default function LoyaltyPage() {
  return (
    <LoyaltyPanel
      ledger={loyaltyLedger}
      balance={pointsBalance()}
      pointValue={POINT_VALUE_INR}
      referral={referral}
    />
  );
}
