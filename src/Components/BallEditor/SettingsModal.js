import React, { Component } from 'react';
import { Button, Form, Checkbox, Input, Icon } from 'semantic-ui-react';

class SettingsModal extends Component {
  render() {
    return (
      <section key="settings-modal">
        <Button onClick={this.props.closeSettingsModal} animated>
          <Button.Content visible>Back</Button.Content>
          <Button.Content hidden>
            <Icon name='left arrow' />
          </Button.Content>
        </Button><br /><br />
        <header>
          <h3>Jupiter Ball Settings</h3>
        </header>
        <Form key='settings-form'>
          <Form.Field key='user-name-input-settings-wrapper'>
            <label>Sequence Name</label>
            <Input maxLength='20' key='user-name-input-settings' type="text" id="name-input" onChange={(event) => this.props.handleSettingsChange(event)} value={this.props.parentState.userName} name="userName" placeholder="User Name Here"
            onFocus={function(e) {
              var val = e.target.value;
              e.target.value = '';
              e.target.value = val;
            }} 
            />
          </Form.Field>
          <Form.Field key="switch-time-settings-wrapper">
            <label>Switch Time</label>
            <input type="number" 
              maxLength={3}
              name="switch_time"
              value={this.props.parentState.switch_time}
              onChange={(event) => this.props.handleSettingsChange(event)}    
              key="switch-time-settings"   
              onFocus={function(e) {
                var val = e.target.value;
                e.target.value = '';
                e.target.value = val;
              }}  
            />
          </Form.Field>
          <Form.Field key="programming-loop-settings-wrapper">
            <Checkbox checked={!!this.props.parentState.program_looping} name="program_looping" onChange={() => this.props.handleSettingsCheck('program_looping')} label='Program Looping' />
          </Form.Field>
          <Form.Field key="start-first-settings-wrapper">
            <Checkbox checked={!!this.props.parentState.start_first} name="start_first" onChange={() => this.props.handleSettingsCheck('start_first')} label='Program Looping' />
          </Form.Field>
        </Form>          
      </section>
    )
  }
}

export default SettingsModal;