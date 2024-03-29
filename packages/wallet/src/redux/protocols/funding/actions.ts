import * as playerA from './player-a/actions';
import * as playerB from './player-b/actions';
import { isNewLedgerFundingAction, NewLedgerFundingAction } from '../new-ledger-funding/actions';
import { WalletAction } from '../../../redux/actions';
// -------
// Actions
// -------

// --------
// Constructors
// --------

// --------
// Unions and Guards
// --------
type EmbeddedAction = NewLedgerFundingAction;
const isEmbeddedAction = isNewLedgerFundingAction;

export type FundingAction = playerA.FundingAction | playerB.FundingAction | EmbeddedAction;

export function isPlayerAFundingAction(action: WalletAction): action is playerA.FundingAction {
  return (
    action.type === 'WALLET.FUNDING.PLAYER_A.CANCELLED' ||
    action.type === 'WALLET.FUNDING.PLAYER_A.FUNDING_SUCCESS_ACKNOWLEDGED' ||
    action.type === 'WALLET.FUNDING.STRATEGY_APPROVED' ||
    action.type === 'WALLET.FUNDING.PLAYER_A.STRATEGY_CHOSEN' ||
    action.type === 'WALLET.FUNDING.PLAYER_A.STRATEGY_REJECTED' ||
    isEmbeddedAction(action)
  );
}
export function isPlayerBFundingAction(action: WalletAction): action is playerB.FundingAction {
  return (
    action.type === 'WALLET.FUNDING.PLAYER_B.CANCELLED' ||
    action.type === 'WALLET.FUNDING.PLAYER_B.FUNDING_SUCCESS_ACKNOWLEDGED' ||
    action.type === 'WALLET.FUNDING.PLAYER_B.STRATEGY_APPROVED' ||
    action.type === 'WALLET.FUNDING.STRATEGY_PROPOSED' ||
    action.type === 'WALLET.FUNDING.PLAYER_B.STRATEGY_REJECTED' ||
    isEmbeddedAction(action)
  );
}

export function isFundingAction(action: WalletAction): action is FundingAction {
  return isPlayerAFundingAction(action) || isPlayerBFundingAction(action);
}
