import {
  LocalizationProps,
  Localized,
  withLocalization,
} from 'fluent-react/compat';
import * as React from 'react';
import { connect } from 'react-redux';
import { UserClient } from 'common/user-clients';
import { Notifications } from '../../../../stores/notifications';
import StateTree from '../../../../stores/tree';
import { User } from '../../../../stores/user';
import { SettingsIcon } from '../../../ui/icons';
import { LinkButton, LabeledInput } from '../../../ui/ui';

import './settings.css';

const Section = ({
  title,
  titleAction,
  className = '',
  children,
  ...props
}: {
  title: string;
  titleAction?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) => (
  <section className={'user-setting ' + className} {...props}>
    <div className="section-title">
      <h2>{title}</h2>
      {titleAction}
    </div>
    {children && <div className="section-body">{children}</div>}
  </section>
);

interface PropsFromState {
  account: UserClient;
}

interface PropsFromDispatch {
  addNotification: typeof Notifications.actions.add;
  saveAccount: typeof User.actions.saveAccount;
}

interface Props extends LocalizationProps, PropsFromState, PropsFromDispatch {}

class Settings extends React.Component<Props> {
  componentDidMount() {
    const { pathname, search } = location;
    if (search.includes('success=false')) {
      this.props.addNotification(
        <Localized id="email-already-used">
          <span />
        </Localized>,
        'error'
      );
      history.replaceState({}, null, pathname);
    } else if (search.includes('success=true')) {
      this.props.addNotification(
        <Localized id="profile-form-submit-saved">
          <span />
        </Localized>
      );
      history.replaceState({}, null, pathname);
    }
  }

  syncSkipSubmissionFeedback = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { saveAccount } = this.props;
    saveAccount({
      skip_submission_feedback: event.target.checked,
    });
  };

  render() {
    const { account, getString } = this.props;
    const firstLanguage = account.locales[0];
    return (
      <div>
        <Section title={getString('login-identity')} className="two-columns">
          <Localized id="email-input" attrs={{ label: true }}>
            <LabeledInput value={account.email} disabled />
          </Localized>

          <Localized id="edit">
            <LinkButton
              outline
              className="edit-button"
              href={location.origin + '/login?change_email'}
            />
          </Localized>
        </Section>

        {account.basket_token && (
          <Section
            title={getString('email-subscriptions')}
            titleAction={
              <a
                className="manage-subscriptions"
                href={`https://www.mozilla.org/${
                  firstLanguage ? firstLanguage.locale + '/' : ''
                }newsletter/existing/${account.basket_token}`}
                target="__blank"
                rel="noopener noreferrer">
                <Localized id="manage-subscriptions">
                  <span />
                </Localized>
                <SettingsIcon />
              </a>
            }
          />
        )}

        <Section title={getString('contribution-experience')} className="box">
          <Localized id="skip-submission-feedback">
            <h3 className="feedback-toggle-title" />
          </Localized>
          <div className="feedback-toggle">
            <input
              type="checkbox"
              onChange={this.syncSkipSubmissionFeedback}
              defaultChecked={account.skip_submission_feedback}
            />
            <Localized id="off">
              <div />
            </Localized>
            <Localized id="on">
              <div />
            </Localized>
          </div>
          <Localized id="skip-submission-description">
            <p className="skip-submission-description" />
          </Localized>
          <Localized id="skip-submission-note">
            <p className="skip-submission-note" />
          </Localized>
        </Section>
      </div>
    );
  }
}

export default connect<PropsFromState, PropsFromDispatch>(
  ({ api, user }: StateTree) => ({
    account: user.account,
  }),
  {
    addNotification: Notifications.actions.add,
    saveAccount: User.actions.saveAccount,
  }
)(withLocalization(Settings));
