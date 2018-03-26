import React, { Component } from 'react';
import { Button, Form, Checkbox, Input, Icon, Popup } from 'semantic-ui-react';

class SettingsModal extends Component {
  render() {
    return (
      <section key="settings-modal">
        <header>
          <h3>Jupiter Ball Settings</h3>
        </header>
        <Form key='settings-form'>
          <Form.Field key='user-name-input-settings-wrapper'>            
            <Popup
              trigger={<label>Creator Name</label>}
              content='Your name or nickname. (Limit 20 Characters)'
              style={{
                borderRadius: 0,
                opacity: 0.7,
                padding: '2em',
              }}
              inverted
            />
            <Input maxLength='20' key='user-name-input-settings' type="text" id="name-input" onChange={(event) => this.props.handleSettingsChange(event)} value={this.props.parentState.userName} name="userName" placeholder="User Name Here"
            onFocus={function(e) {
              var val = e.target.value;
              e.target.value = '';
              e.target.value = val;
            }} 
            />
          </Form.Field>
          <Form.Field key="switch-time-settings-wrapper">            
            <Popup
              trigger={<label>Switch Time</label>}
              content='This is how quickly pressing a button will dim/brighten the jupiter'
              style={{
                borderRadius: 0,
                opacity: 0.7,
                padding: '2em',
              }}
              inverted
            />
            <Input type="number" 
              maxLength='3'
              min={10}
              max={999}
              error={this.props.parentState.switch_time >= 10 && this.props.parentState.switch_time <= 999 ? false : true}
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
            <Popup
              trigger={<Icon name={'refresh'} />}
              content='Should the jupiter loop through all programs continuously?'
              style={{
                borderRadius: 0,
                opacity: 0.7,
                padding: '2em',
              }}
              inverted
            />
            <Checkbox checked={!!this.props.parentState.program_looping} name="program_looping" onChange={() => this.props.handleSettingsCheck('program_looping')} label='Program Looping' />
          </Form.Field>
          <Form.Field key="start-first-settings-wrapper">
            <Popup
              trigger={<Icon name={'wizard'} />}
              content='Should the jupiter start on the last program being used when it was turned off?'
              style={{
                borderRadius: 0,
                opacity: 0.7,
                padding: '2em',
              }}
              inverted
            />
            <Checkbox checked={!!this.props.parentState.start_first} name="start_first" onChange={() => this.props.handleSettingsCheck('start_first')} label='Start First' />
          </Form.Field>
        </Form>          
      </section>
    )
  }
}

export default SettingsModal;