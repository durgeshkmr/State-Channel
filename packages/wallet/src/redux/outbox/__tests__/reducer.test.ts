import { clearOutbox } from '../reducer';

import * as actions from '../../actions';
import * as outgoing from 'magmo-wallet-client/lib/wallet-events';
import * as scenarios from '../../__tests__/test-scenarios';
import { OutboxState } from '../state';
import { sendStrategyApproved, sendStrategyProposed } from '../../../communication';

const { mockTransactionOutboxItem } = scenarios;

describe('when a side effect occured', () => {
  const processId = '0x0';
  const sendMessageA = sendStrategyProposed('0xa00', processId, 'IndirectFundingStrategy');
  const sendMessageB = sendStrategyApproved('0xb00', processId);
  const displayOutbox = [outgoing.hideWallet(), outgoing.showWallet()];
  const transactionOutbox = [mockTransactionOutboxItem, mockTransactionOutboxItem];
  const messageOutbox = [sendMessageA, sendMessageB];
  const state: OutboxState = {
    displayOutbox,
    transactionOutbox,
    messageOutbox,
  };

  it('clears the first element of the displayOutbox', () => {
    const action = actions.displayMessageSent({});
    const updatedState = clearOutbox(state, action);
    expect(updatedState.displayOutbox).toMatchObject(displayOutbox.slice(1));
  });

  it('clears the first element of the messageOutbox', () => {
    const action = actions.messageSent({});
    const updatedState = clearOutbox(state, action);
    expect(updatedState.messageOutbox).toMatchObject(messageOutbox.slice(1));
  });

  it('clears the first element of the transactionOutbox', () => {
    const action = actions.transactionSent({ processId: 'processId' });
    const updatedState = clearOutbox(state, action);
    expect(updatedState.transactionOutbox).toMatchObject(transactionOutbox.slice(1));
  });
});
