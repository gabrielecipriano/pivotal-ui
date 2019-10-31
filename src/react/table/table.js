import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import '../../css/tables/index.js';
import {Collapsible} from '../collapsible';
import {Icon} from '../iconography';
import {DefaultButton} from '../buttons';
import {Checkbox} from '../checkbox';

export const Table = ({className, ...props}) => (
  <table {...props} {...{
    className: classnames('pui-table', className)
  }}/>
);

export const Caption = ({className, children, ...props}) =>
  (<caption {...{...props, className: classnames(className, 'em-high h5 txt-l')}}>{children}</caption>);
export const Thead = props => <thead {...props}/>;
export const Tbody = props => <tbody {...props}/>;
export const Tfoot = props => <tfoot {...props}/>;
export const Tr = props => <tr {...props}/>;
export const Td = props => <td {...props}/>;
export const Th = ({scope = 'col', ...props}) => <th {...props} {...{scope}}/>;

export const SelectionContext = React.createContext({
  isSelectableTable: false,
  isSelected: ()=>false,
  toggleSelected: ()=>{},
  allAreSelected: ()=>false,
  someAreSelected: ()=>false,
  toggleSelectAll: ()=>{},
});

export class TableSelectable extends React.PureComponent {
  static propTypes = {
    onSelectionChange: PropTypes.func.isRequired,
    children: PropTypes.node,
    identifiers: PropTypes.array.isRequired
  };

  constructor (props) {
    super(props);
    this.state = {
      selection: {},
      selectionContextValue: {
        isSelectableTable: true,
        isSelected: this.isSelected,
        toggleSelected: this.toggleSelected,

        allAreSelected: this.allAreSelected,
        someAreSelected: this.someAreSelected,
        toggleSelectAll: this.toggleSelectAll,
      }
    };
  }

  isSelected = (identifier) => this.state.selection[identifier] === true;
  allAreSelected = () => Object.entries(this.state.selection).length === this.props.identifiers.length;
  noneAreSelected = () => Object.entries(this.state.selection).length === 0;
  someAreSelected = () => !this.allAreSelected() && !this.noneAreSelected();

  _selectOne = (id, draftState) => draftState[id] = true;
  _deselectOne = (id, draftState) => delete draftState[id];

  toggleSelected = (identifier) => {
    let draftSelection = Object.assign({}, this.state.selection);
    if(this.isSelected(identifier)) {
      this._deselectOne(identifier, draftSelection);
    } else {
      this._selectOne(identifier, draftSelection);
    }

    this.props.onSelectionChange(draftSelection);
    this.setState({selection: draftSelection });
  };

  toggleSelectAll = () => {
    let draftSelection = {};

    if (this.noneAreSelected()) {
      this.props.identifiers.forEach(id => this._selectOne(id, draftSelection));
    }

    this.props.onSelectionChange(draftSelection);
    // update the context value to a clone to cause react to rerender all consumers:
    let forceUpdate = Object.assign({}, this.state.selectionContextValue);
    this.setState({selection: draftSelection, selectionContextValue: forceUpdate});
  };

  render() {
    const {onSelectionChange, identifiers, ...props} = this.props;
    return (
        <SelectionContext.Provider value={this.state.selectionContextValue}>
          <Table {...props} />
        </SelectionContext.Provider>
    );
  }
}

export const TrHeader = ({children, withoutSelectAll}) =>
    (<Tr>
      {
        <SelectionContext.Consumer>
          {context => {
            if (context.isSelectableTable) {
              return (
                  <Th className={classnames('pui-table--selectable-toggle border-right-0')}>
                    {withoutSelectAll ? null :
                        (<Checkbox
                            checked={context.allAreSelected()}
                            indeterminate={context.someAreSelected()}
                            onChange={context.toggleSelectAll}
                        />)}
                  </Th>
              );
            }
          }}
        </SelectionContext.Consumer>
      }
      {children}
    </Tr>);

export const TrHeaderForDrawers = ({children, ...props}) =>
    (<TrHeader {...props}>
      <Th className="pui-table--collapsible-toggle border-right-0"/>
      {children}
    </TrHeader>);

export class TrForBody extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node,
    identifier: PropTypes.string,
    notSelectable: PropTypes.bool,
    activated: PropTypes.bool,
  };

  render() {
    const {children, identifier, notSelectable, activated, className} = this.props;

    return (<Tr className={className}>
      {
        <SelectionContext.Consumer>
          {context => {
            if (context.isSelectableTable) {
              return (
                  <Td className={classnames('border-right-0', {'active-indicator': activated})}>
                    {notSelectable ? null :
                        (<Checkbox
                            checked={context.isSelected(identifier)}
                            indeterminate={false}
                            onChange={() => {
                              context.toggleSelected(identifier);
                              this.forceUpdate();
                            }}/>)
                    }
                  </Td>
              );
            }
          }}
        </SelectionContext.Consumer>
      }
      {children}
    </Tr>);
  }
}

export const TrWithoutDrawer = ({children, ...props}) =>
    (<TrForBody {...props}>
      <Td className="pui-table--collapsible-toggle border-right-0"/>
      {children}
    </TrForBody>);

export class TrWithDrawer extends React.PureComponent {
  static propTypes = {
    ariaLabelCollapsed: PropTypes.string.isRequired,
    ariaLabelExpanded: PropTypes.string.isRequired,
    drawerContent: PropTypes.node,
    onExpand: PropTypes.func,
    children: PropTypes.node,
    identifier: PropTypes.string,
    notSelectable: PropTypes.bool,
  };

  static contextType = SelectionContext;
  state = {expanded: false};

  render() {
    const {
      ariaLabelCollapsed,
      ariaLabelExpanded,
      children,
      className,
      drawerContent,
      onExpand,
      identifier,
      notSelectable
    } = this.props;
    const {expanded} = this.state;
    const selectableTable = this.context.isSelectableTable;

    return (<Fragment>
      <TrForBody className={classnames({'border-bottom': !expanded})}
                 activated={expanded}
                 notSelectable={notSelectable}
                 identifier={identifier}
      >
        <Td className={classnames('border-right-0', {'active-indicator': expanded && !selectableTable})}>
          <DefaultButton
            className="pui-table--collapsible-btn"
            icon={<Icon src="chevron_right" className={
              classnames('transition-transform', {'rotate-qtr-turn': expanded})
            }/>}
            onClick={() => {
              if (!expanded && onExpand) onExpand();
              this.setState(({expanded}) => ({expanded: !expanded}));
            }}
            iconOnly
            flat
            aria-label={expanded ? ariaLabelExpanded : ariaLabelCollapsed}
          />
        </Td>
        {children}
      </TrForBody>
      <Tr className={classnames(className, {'border-top-0 display-none': !expanded})}>
        <Td colSpan={1 + children.length + (selectableTable ? 1:0)} className="pan">
          <Collapsible {...{expanded}}>
            {drawerContent}
          </Collapsible>
        </Td>
      </Tr>
    </Fragment>);
  }
}
