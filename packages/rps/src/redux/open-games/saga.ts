import { fork, take, select, cancel, call, apply, put } from 'redux-saga/effects';

export const getGameState = (storeObj: any) => storeObj.game.gameState;
// export const getWalletAddress = (storeObj: any) => storeObj.wallet.address;

import { default as firebase, reduxSagaFirebase } from '../../gateways/firebase';

import * as actions from './actions';

import { StateName, GameState } from '../game/state';
import { bigNumberify } from 'ethers/utils';

export default function* openGameSaga() {
  // could be more efficient by only watching actions that could change the state
  // this is more robust though, so stick to watching all actions for the time being
  let openGameSyncerProcess: any = null;
  let myGameIsOnFirebase = false;

  while (true) {
    yield take('*');

    const gameState: GameState = yield select(getGameState);
    const address = gameState.myAddress;

    if (gameState.name === StateName.Lobby) {
      // if we're in the lobby we need to sync openGames
      if (!openGameSyncerProcess || !openGameSyncerProcess.isRunning()) {
        openGameSyncerProcess = yield fork(openGameSyncer);
      }
    } else {
      // if we're not in the lobby, we shouldn't be syncing openGames
      if (openGameSyncerProcess) {
        yield cancel(openGameSyncerProcess);
      }
    }

    if (gameState.name === StateName.WaitingRoom) {
      // if we don't have a wallet address, something's gone very wrong
      if (address) {
        const myOpenGameKey = `/challenges/${address}`;

        if (!myGameIsOnFirebase) {
          // my game isn't on firebase (as far as the app knows)
          // attempt to put the game on firebase - will be a no-op if already there

          const myOpenGame = {
            address,
            name: gameState.myName,
            stake: gameState.roundBuyIn.toString(),
            createdAt: new Date().getTime(),
            isPublic: true,
          };

          const disconnect = firebase
            .database()
            .ref(myOpenGameKey)
            .onDisconnect();
          yield apply(disconnect, disconnect.remove);
          // use update to allow us to pick our own key
          yield call(reduxSagaFirebase.database.update, myOpenGameKey, myOpenGame);
          myGameIsOnFirebase = true;
        }
      }
    } else {
      if (myGameIsOnFirebase) {
        // if we don't have a wallet address, something's gone very wrong
        if (address) {
          const myOpenGameKey = `/challenges/${address}`;
          yield call(reduxSagaFirebase.database.delete, myOpenGameKey);
          myGameIsOnFirebase = false;
        }
      }
    }
  }
}
// maps { '0xabc': openGame1Data, ... } to [openGame1Data, ....]
const openGameTransformer = dict => {
  if (!dict.value) {
    return [];
  }
  return Object.keys(dict.value).map(key => {
    // Convert to a proper BN hex string
    dict.value[key].stake = bigNumberify(dict.value[key].stake).toHexString();
    return dict.value[key];
  });
};

function* openGameSyncer() {
  if (process.env.NODE_ENV === 'development' && process.env.BOT_URL) {
    try {
      // If the bot url is configured, try to fetch from the local server wallet
      // Assumes the server is running locally at the configured url
      const response = yield fetch(`${process.env.BOT_URL}/api/v1/rps_games`).then(r => r.json());
      yield put(
        actions.syncOpenGames(response.games.map(g => ({ ...g, address: response.address }))),
      );
    } catch (err) {
      if (
        err.message === 'Failed to fetch' ||
        err.message === 'NetworkError when attempting to fetch resource.'
      ) {
        console.log(`WARNING: server wallet not running at ${process.env.BOT_URL}`);
      } else {
        throw err;
      }
    }
  }
  yield fork(
    reduxSagaFirebase.database.sync,
    'challenges',
    {
      successActionCreator: actions.syncOpenGames,
      transform: openGameTransformer,
    },
    'value',
  );
}
