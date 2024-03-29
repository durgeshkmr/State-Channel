import * as states from './states';
import { PureComponent } from 'react';
import { Withdrawal } from '../withdrawing/container';
import React from 'react';
import Failure from '../shared-components/failure';
import Success from '../shared-components/success';
import { connect } from 'react-redux';
import { IndirectDefunding } from '../indirect-defunding/container';

interface Props {
  state: states.DefundingState;
}

class DefundingContainer extends PureComponent<Props> {
  render() {
    const { state } = this.props;
    switch (state.type) {
      case 'Defunding.WaitForWithdrawal':
        return <Withdrawal state={state.withdrawalState} />;
      case 'Defunding.WaitForIndirectDefunding':
        return <IndirectDefunding state={state.indirectDefundingState} />;
      case 'Defunding.Failure':
        return <Failure name="de-funding" reason={state.reason} />;
      case 'Defunding.Success':
        return <Success name="de-funding" />;
    }
  }
}
export const Defunding = connect(
  () => ({}),
  () => ({}),
)(DefundingContainer);
