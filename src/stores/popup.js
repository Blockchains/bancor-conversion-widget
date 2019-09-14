import { writable } from "svelte/store";
import {} from "web3x-es";

const isOpen = writable(false);
const open = () => {
  isOpen.update(() => true);
};
const close = () => {
  isOpen.update(() => false);
};

const Step = ({ text, fn }) => {
  const step = writable({
    text,
    fn,
    pending: false,
    success: undefined,
    txHash: undefined
  });

  // wrap fn to provide step instance
  step.update(_step => {
    _step.fn = () => {
      return fn(step);
    };

    return _step;
  });

  return step;
};

const SyncStep = fn => step => {
  step.update(o => ({
    ...o,
    pending: true
  }));

  const fail = () => {
    step.update(o => ({
      ...o,
      success: undefined,
      pending: false
    }));
  };

  return fn(step)
    .then(tx => {
      step.update(o => ({
        ...o,
        success: undefined,
        pending: true
      }));

      tx.getTxHash()
        .then(txHash => {
          step.update(o => ({
            ...o,
            txHash
          }));
        })
        .catch(err => {
          console.error(err);
          fail();
        });

      return tx
        .getReceipt()
        .then(() => {
          step.update(o => ({
            ...o,
            success: true,
            pending: false
          }));
        })
        .catch(err => {
          console.error(err);
          fail();
        });
    })
    .catch(err => {
      console.error(err);
      fail();
    });
};

const steps = writable([]);
const addSteps = _steps => {
  steps.update(() => _steps);
};

export { isOpen, open, close, steps, Step, SyncStep, addSteps };