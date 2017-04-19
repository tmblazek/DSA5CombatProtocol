import React, { Component, PropTypes } from "react";
import GlyphButton from "components/glyph-button";
import EditButtons from "components/edit-buttons";
import Weapon from "components/weapon";
import RangeWeapon from "components/range-weapon";
import Armor from "components/armor";
import NumericControl from "components/numeric-control";
import MiniStates from "components/ministates";
import {getPaBoni, getIniBoni} from "components/bonusCalculations";
import { ItemTypes } from "components/constants";
import { Col, Row, ListGroup, Panel } from "react-bootstrap";
import { DragSource } from "react-dnd";

const playerSource = {
  isDragging(props, monitor) {
    // If your component gets unmounted while dragged
    return monitor.getItem().id === props.id;
  },

  beginDrag(props, monitor, component) {
    // Return the data describing the dragged item
    const item = { id: props.id };
    return item;
  },

  endDrag(props, monitor, component) {
    if (!monitor.didDrop()) {
      // You can check whether the drop was successful
      // or if the drag ended but nobody handled the drop
      return;
    }

    // When dropped on a compatible target, do something.
    // Read the original dragged item from getItem():
    const item = monitor.getItem();

    // You may also read the drop result from the drop target
    // that handled the drop, if it returned an object from
    // its drop() method.
    const dropResult = monitor.getDropResult();

    console.log("end drag player " + item.id + " on location " + dropResult.id);
    component.movePlayer(item.id, dropResult.id);
  }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

class Player extends Component {

  constructor(props) {
    super(props);

    this.removePlayer = () => {this.props.onRemove(this.props.id);};
    this.editPlayer = () => {this.props.onEdit(this.props.id);};
    this.duplicatePlayer = () => {this.props.onDuplicate(this.props.id);};
    this.movePlayer = (player_id, location_id) => { this.props.onMove(player_id, location_id);};

    this.onPropertyChange = ( name, value) => {this.props.onEdit(this.props.id, name, value);};
    this.onGearChange = ( name, prop, value) => {this.props.onGearEdit(this.props.id, name, prop, value);};
  }

  createWeapon(weapon, id, states) {
    return (<Weapon weapon={weapon} states={states} key={id} onEdit={this.onGearChange} />);
  }

  createRangeWeapon(weapon, id, states) {
    return (<RangeWeapon rangeWeapon={weapon} states={states} key={id} onEdit={this.onGearChange} />);
  }

  createArmor(armor, id, states) {
    return (<Armor armor={armor} states={states} key={id} onEdit={this.onGearChange} />);
  }


  renderProperties() {

    const {player} = this.props;
    const {le, ini, dodge, ae, ke, mage, priest, states, gear} = player;

    let weapons = "";
    let armors = "";
    let rangeWeapons = "";
    if(gear.length > 0) {
      weapons = gear.filter(g => g.type == "weapon").map((w,i) => {return this.createWeapon(w,i,states);});
      rangeWeapons = gear.filter(g => g.type == "range").map((w,i) => {return this.createRangeWeapon(w,i,states);});
      armors = gear.filter(g => g.type == "armor").map((a,i) => {return this.createArmor(a,i);});
    }


    return (
        <Col sm={12}>
          <Panel>
            <ListGroup fill>
              <NumericControl tooltip="Lebensenergie" title="LE" name="le" value={le} onChange={this.onPropertyChange} />
              <NumericControl tooltip="Initiative" title="IN"
                states={getIniBoni(states)}
                name="ini" value={ini} onChange={this.onPropertyChange} />
              <NumericControl tooltip="Ausweichen" title="AW"
                states={getPaBoni(states, "kurz")}
                name="dodge" value={dodge} onChange={this.onPropertyChange} />
              {mage && <NumericControl tooltip="Astralenergie" title="AE" name="ae" value={ae} onChange={this.onPropertyChange} />}
              {priest && <NumericControl tooltip="Karmalenergie" title="KE" name="ke" value={ke} onChange={this.onPropertyChange} />}
            </ListGroup>
          </Panel>
          {weapons}
          {rangeWeapons}
          {armors}
        </Col>
    );
  }

  renderTitle() {
    const {hero, name, states } = this.props.player;
    const player_string = hero ? "Helden" : "Gegner";
    const title = player_string + " " + name;

    return (
      <EditButtons title={title} onRemove={this.removePlayer} onEdit={this.editPlayer} onDuplicate={this.duplicatePlayer} >
        <h4>{name}</h4>
        <MiniStates states={states} />
      </EditButtons>
    );
  }

  render() {
    const { hero } = this.props.player;
    const { connectDragSource, isDragging} = this.props;

    return connectDragSource(
      <div style={{
        opacity: isDragging ? 0.5 : 1
      }}>
        <Col lg={6} md={6} sm={12}>
          <div className={hero ? "hero" : "enemy"}>
            <Panel collapsible defaultExpanded={true} header={this.renderTitle()}>
              <Row>
              { this.renderProperties() }
              </Row>
            </Panel>
          </div>
        </Col>
      </div>
    );
  }
}

Player.defaultProps = {
  graveyard: false,
  location_id: ""
};

Player.propTypes = {
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  id: PropTypes.number.isRequired
};

export default DragSource(ItemTypes.PLAYER, playerSource, collect)(Player);
