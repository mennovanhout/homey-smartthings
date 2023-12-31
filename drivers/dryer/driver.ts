import Homey, { FlowCardCondition, FlowCardTriggerDevice } from 'homey';
import { BearerTokenAuthenticator, SmartThingsClient } from '@smartthings/core-sdk';
import SmartThingsDriver from '../../shared/SmartThingsDriver';

class Driver extends SmartThingsDriver {

  // @ts-ignore
  private _deviceJobStateBecame: FlowCardTriggerDevice;
  // @ts-ignore
  private _deviceMachineStateBecame: FlowCardTriggerDevice;
  // @ts-ignore
  private _deviceIsDoingJob: FlowCardCondition;
  // @ts-ignore
  private _deviceIsInState: FlowCardCondition;
  // @ts-ignore
  public deviceAPI: SmartThingsClient;

  async onInit() {
    this.requiredCapabilities = ['dryerOperatingState'];

    // When dryer job became flow card
    this._deviceJobStateBecame = this.homey.flow.getDeviceTriggerCard('when-the-dryer-job-became');
    this._deviceJobStateBecame.registerRunListener(async (args, state) => {
      return args.dryer_job_state === state.dryer_job_state;
    });

    // When machine state became flow card
    this._deviceMachineStateBecame = this.homey.flow.getDeviceTriggerCard('when-the-dryer-state-became');
    this._deviceMachineStateBecame.registerRunListener(async (args, state) => {
      return args.dryer_machine_state === state.dryer_machine_state;
    });

    // Is doing job ... flow card
    this._deviceIsDoingJob = this.homey.flow.getConditionCard('dryer-is-doing-job');
    this._deviceIsDoingJob.registerRunListener(async (args, state) => {
      return args.dryer_job_state === args.device.getCapabilityValue('dryer_job_state');
    });

    // Is in state ... flow card
    this._deviceIsInState = this.homey.flow.getConditionCard('dryer-is-in-state');
    this._deviceIsInState.registerRunListener(async (args, state) => {
      return args.dryer_machine_state === args.device.getCapabilityValue('dryer_machine_state');
    });

    this.deviceAPI = new SmartThingsClient(new BearerTokenAuthenticator(this.homey.settings.get('token')));
  }

  triggerDryerJobBecameFlow(device: Homey.Device, tokens: any, state:any) {
    this._deviceJobStateBecame.trigger(device, tokens, state).then(this.log).catch(this.error);
  }

  triggerDryerStateBecameFlow(device: Homey.Device, tokens: any, state:any) {
    this._deviceMachineStateBecame.trigger(device, tokens, state).then(this.log).catch(this.error);
  }

}

module.exports = Driver;
