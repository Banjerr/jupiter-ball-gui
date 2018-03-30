import React, { Component } from 'react';
import { Form, Checkbox, Input, Icon, Popup } from 'semantic-ui-react';

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
            <Input inverted maxLength='20' key='user-name-input-settings' type="text" id="name-input" onChange={(event) => this.props.handleSettingsChange(event)} value={this.props.parentState.userName} name="userName" placeholder="User Name Here"
            onFocus={function(e) {
              var val = e.target.value;
              e.target.value = '';
              e.target.value = val;
            }} 
            />
          </Form.Field>
          <Form.Field key="switch-time-settings-wrapper">            
            <Popup
              trigger={<label>Brightness Lap Time (1-999)</label>}
              content='The time between changes of brightness levels when button is pressed (10 levels altogether)'
              style={{
                borderRadius: 0,
                opacity: 0.8,
                padding: '2em',
              }}
              inverted
            />
            <Input type="number" 
              maxLength='3'
              min={1}
              max={999}
              error={this.props.parentState.switch_time >= 1 && this.props.parentState.switch_time <= 999 ? false : true}
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
              content='If checked the last sequence will loop back to the first on the next button click.'
              style={{
                borderRadius: 0,
                opacity: 0.7,
                padding: '2em',
              }}
              inverted
            />
            <Checkbox checked={!!this.props.parentState.program_looping} name="program_looping" onChange={() => this.props.handleSettingsCheck('program_looping')} label='Sequence Looping' />
          </Form.Field>
          <Form.Field key="start-first-settings-wrapper">
            <Popup
              trigger={<Icon name={'wizard'} />}
              content='If checked the Jupiter will start on the same sequence in which it was shut off'
              style={{
                borderRadius: 0,
                opacity: 0.7,
                padding: '2em',
              }}
              inverted
            />
            <Checkbox checked={!!this.props.parentState.start_first} name="start_first" onChange={() => this.props.handleSettingsCheck('start_first')} label='Start On First Sequence' />
          </Form.Field>
        </Form>          
      </section>
    )
  }
}

export default SettingsModal;