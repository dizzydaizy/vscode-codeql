import { ConfigurationTarget } from 'vscode';
import { ALL_SETTINGS, InspectionResult, Setting } from '../config';

class TestSetting<T> {
  private initialSettingState: InspectionResult<T> | undefined;

  constructor(
    public readonly setting: Setting,
    private initialTestValue: T | undefined = undefined
  ) { }

  public async get(): Promise<T | undefined> {
    return this.setting.getValue();
  }

  public async set(value: T | undefined, target: ConfigurationTarget = ConfigurationTarget.Global): Promise<void> {
    await this.setting.updateValue(value, target);
  }

  public async setInitialTestValue(value: T | undefined) {
    this.initialTestValue = value;
  }

  public async initialSetup() {
    this.initialSettingState = this.setting.inspect();

    // Unfortunately it's not well-documented how to check whether we can write to a workspace
    // configuration. This is the best I could come up with. It only fails for initial test values
    // which are not undefined.
    if (this.initialSettingState?.workspaceValue !== undefined) {
      await this.set(this.initialTestValue, ConfigurationTarget.Workspace);
    }
    if (this.initialSettingState?.workspaceFolderValue !== undefined) {
      await this.set(this.initialTestValue, ConfigurationTarget.WorkspaceFolder);
    }

    await this.setup();
  }

  public async setup() {
    await this.set(this.initialTestValue, ConfigurationTarget.Global);
  }

  public async restoreToInitialValues() {
    const state = this.setting.inspect();

    // We need to check the state of the setting before we restore it. This is less important for the global
    // configuration target, but the workspace/workspace folder configuration might not even exist. If they
    // don't exist, VSCode will error when trying to write the new value (even if that value is undefined).
    if (state?.globalValue !== this.initialSettingState?.globalValue) {
      await this.set(this.initialSettingState?.globalValue, ConfigurationTarget.Global);
    }
    if (state?.workspaceValue !== this.initialSettingState?.workspaceValue) {
      await this.set(this.initialSettingState?.workspaceValue, ConfigurationTarget.Workspace);
    }
    if (state?.workspaceFolderValue !== this.initialSettingState?.workspaceFolderValue) {
      await this.set(this.initialSettingState?.workspaceFolderValue, ConfigurationTarget.WorkspaceFolder);
    }
  }
}

// The test settings are all settings in ALL_SETTINGS which don't have any children
const TEST_SETTINGS = ALL_SETTINGS
  .filter(setting => ALL_SETTINGS.filter(s => s.parent === setting).length === 0)
  .map(setting => new TestSetting(setting));

export const getTestSetting = (setting: Setting): TestSetting<unknown> | undefined => {
  return TEST_SETTINGS.find(testSetting => testSetting.setting === setting);
};

export const testConfigHelper = async (mocha: Mocha) => {
  // Read in all current settings
  await Promise.all(TEST_SETTINGS.map(setting => setting.initialSetup()));

  mocha.rootHooks({
    async beforeEach() {
      // Reset the settings to their initial values before each test
      await Promise.all(TEST_SETTINGS.map(setting => setting.setup()));
    },
    async afterAll() {
      // Restore all settings to their default values after each test suite
      await Promise.all(TEST_SETTINGS.map(setting => setting.restoreToInitialValues()));
    }
  });
};
