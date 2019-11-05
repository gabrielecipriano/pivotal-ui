import React from 'react';
import ReactDOM from 'react-dom';
import {
  Caption,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  TrHeader,
  TrHeaderForDrawers,
  TrWithDrawer,
  TrWithoutDrawer,
  SelectionContext,
  SelectableContextWrapper,
  TrForBody
} from '../../../src/react/table';

describe('Table', () => {
  it('renders a table', () => {
    ReactDOM.render(<Table/>, root);
    expect('table').toExist();
    expect('table').toHaveClass('pui-table');
  });

  it('passes through classnames', () => {
    ReactDOM.render(<Table className="my-table"/>, root);
    expect('table').toHaveClass('my-table');
  });

  describe('when in a selectable context', () => {
    it('clips the selection when some of the identifiers are deleted', () => {
      const onSelectionChange = jest.fn();
      ReactDOM.render(
          <SelectableContextWrapper identifiers={['GH', 'MH', 'AT']} onSelectionChange={onSelectionChange}>
            <Table>
              <Thead>
                <TrHeader/>
              </Thead>
            </Table>
          </SelectableContextWrapper>, root);

      document.querySelector('thead input').click();
      expect(onSelectionChange).toHaveBeenNthCalledWith(1, {'GH': true, 'MH': true, 'AT':true });

      ReactDOM.render(
          <SelectableContextWrapper identifiers={['GH', 'MH']} onSelectionChange={onSelectionChange}>
            <Table>
              <Thead>
                <TrHeader/>
              </Thead>
            </Table>
          </SelectableContextWrapper>, root);

      expect(onSelectionChange).toHaveBeenNthCalledWith(2, {'GH': true, 'MH': true});
    });

    it('preserves the selection when new identifiers are added', () => {
      const onSelectionChange = jest.fn();

      ReactDOM.render(
          <SelectableContextWrapper identifiers={['GH']} onSelectionChange={onSelectionChange}>
            <Table>
              <Thead>
                <TrHeader/>
              </Thead>
            </Table>
          </SelectableContextWrapper>, root);

      document.querySelector('thead input').click();
      expect(onSelectionChange).toHaveBeenNthCalledWith(1, {'GH': true});

      ReactDOM.render(
          <SelectableContextWrapper identifiers={['GH', 'MH', 'AT']} onSelectionChange={onSelectionChange}>
            <Table>
              <Thead>
                <TrHeader/>
              </Thead>
            </Table>
          </SelectableContextWrapper>, root);

      expect(onSelectionChange).toHaveBeenCalledTimes(1);
    });

  });
});

describe('Caption', () => {
  it('renders a caption', () => {
    ReactDOM.render(<Table><Caption>My cool table</Caption></Table>, root);
    expect('caption').toHaveText('My cool table');
  });

  it('passes through classnames', () => {
    ReactDOM.render(<Table><Caption className="my-caption">My cool table</Caption></Table>, root);
    expect('caption').toHaveClass('my-caption');
  });
});

describe('Th', () => {
  it('defaults the scope to col', () => {
    ReactDOM.render(<Table><Thead><Tr><Th>My awesome header</Th></Tr></Thead></Table>, root);
    expect('table thead tr th').toHaveAttr('scope', 'col');
  });
});

describe('SelectionContext', () => {
  let contextValue;
  let onSelectionChange;

  beforeEach(() => {
    contextValue = 'fakeContext';
    onSelectionChange = jest.fn();

    ReactDOM.render(
        <SelectableContextWrapper identifiers={['MH', 'AT']} onSelectionChange={onSelectionChange}>
          <SelectionContext.Consumer>
            {value => { contextValue = value; }}
          </SelectionContext.Consumer>
        </SelectableContextWrapper>, root);
  });

  it('creates a selection context', () => {
    expect(contextValue.isInSelection).toBeTruthy();
  });

  it('can select one', () => {
    expect(contextValue.isSelected('MH')).toBeFalsy();
    expect(contextValue.isSelected('AT')).toBeFalsy();
    expect(contextValue.allAreSelected()).toBeFalsy();
    expect(contextValue.someAreSelected()).toBeFalsy();

    contextValue.toggleSelected('MH');

    expect(contextValue.isSelected('MH')).toBeTruthy();
    expect(contextValue.isSelected('AT')).toBeFalsy();
    expect(contextValue.allAreSelected()).toBeFalsy();
    expect(contextValue.someAreSelected()).toBeTruthy();
  });

  it('can deselect one', () => {
    contextValue.toggleSelected('MH');
    contextValue.toggleSelected('MH');
    expect(contextValue.isSelected('MH')).toBeFalsy();
  });

  it('can select all', () => {
    contextValue.toggleSelectAll();
    expect(contextValue.isSelected('MH')).toBeTruthy();
    expect(contextValue.isSelected('AT')).toBeTruthy();
  });

  it('can deselect all', () => {
    contextValue.toggleSelectAll();
    contextValue.toggleSelectAll();
    expect(contextValue.isSelected('MH')).toBeFalsy();
    expect(contextValue.isSelected('AT')).toBeFalsy();
  });

  it('clips the selection when some of the identifiers are deleted', () => {
    contextValue.toggleSelectAll();

    const secondRenderIdentifiers = ['MH'];
    ReactDOM.render(
        <SelectableContextWrapper identifiers={secondRenderIdentifiers} onSelectionChange={() => {}}>
          <SelectionContext.Consumer>
            {value => { contextValue = value; }}
          </SelectionContext.Consumer>
        </SelectableContextWrapper>, root);

    expect(contextValue.isSelected('MH')).toBeTruthy();
    expect(contextValue.isSelected('AT')).toBeFalsy();
    expect(contextValue.allAreSelected()).toBeTruthy();
  });

  it('preserves the selection when new identifiers are added', () => {
    contextValue.toggleSelectAll();

    const secondRenderIdentifiers = ['MH', 'AT', 'AR'];
    ReactDOM.render(
        <SelectableContextWrapper identifiers={secondRenderIdentifiers} onSelectionChange={() => {}}>
          <SelectionContext.Consumer>
            {value => { contextValue = value; }}
          </SelectionContext.Consumer>
        </SelectableContextWrapper>, root);

    expect(contextValue.isSelected('MH')).toBeTruthy();
    expect(contextValue.isSelected('AT')).toBeTruthy();
    expect(contextValue.isSelected('AR')).toBeFalsy();
    expect(contextValue.allAreSelected()).toBeFalsy();
    expect(contextValue.someAreSelected()).toBeTruthy();
  });

  it('deselectAll clears the selection', () => {
    contextValue.toggleSelected('MH');
    contextValue.deselectAll();

    expect(contextValue.isSelected('MH')).toBeFalsy();
    expect(contextValue.isSelected('AT')).toBeFalsy();
    expect(onSelectionChange).toHaveBeenCalledWith({});
  });
});

describe('TrHeader', () => {
  it('renders table header cells given as children', () => {
    ReactDOM.render(<Table><Thead><TrHeader>
      <Th>Content header 1</Th>
      <Th>Content header 2</Th>
    </TrHeader></Thead></Table>, root);

    const ths = document.querySelectorAll('th');
    expect(ths).toHaveLength(2);
    expect(ths[0]).toHaveText('Content header 1');
    expect(ths[1]).toHaveText('Content header 2');
  });
});

describe('TrHeaderForDrawers', () => {
  describe('in a standard table', () => {
    beforeEach(() => {
      ReactDOM.render(<Table><Thead><TrHeaderForDrawers>
        <Th>Content header 1</Th>
        <Th>Content header 2</Th>
      </TrHeaderForDrawers></Thead></Table>, root);
    });

    it('renders an empty table header that sets the column' +
        'to the proper width for collapsible toggles',
        () => {
          expect(document.querySelectorAll('th')[0]).toHaveText('');
          expect(document.querySelectorAll('th')[0]).toHaveClass('pui-table--collapsible-toggle');
        }
    );

    it('renders table header cells given as children after the toggle header cell', () => {
      const ths = document.querySelectorAll('th');
      expect(ths).toHaveLength(3);
      expect(ths[1]).toHaveText('Content header 1');
      expect(ths[2]).toHaveText('Content header 2');
    });
  });

  describe('when in a selectable context', ()=>{
    it('renders a table header that sets the column ' +
        'to the proper width for collapsible toggles and selectOne checkboxes',
        () => {
          ReactDOM.render(
              <SelectableContextWrapper identifiers={[]} onSelectionChange={() => {}}>
                <Table>
                  <Thead>
                    <TrHeaderForDrawers>
                      <Th>Content header 1</Th>
                      <Th>Content header 2</Th>
                    </TrHeaderForDrawers>
                  </Thead>
                </Table>
              </SelectableContextWrapper>, root);

          expect(document.querySelectorAll('th')[0]).toHaveClass('pui-table--selectable-toggle');
          expect(document.querySelectorAll('th')[1]).toHaveClass('pui-table--collapsible-toggle');
        }
    );
  });
});

describe('TrWithoutDrawer', () => {
  beforeEach(() => {
    ReactDOM.render(<Table>
      <Tbody>
        <TrWithoutDrawer>
          <Td>Content cell 1</Td>
          <Td>Content cell 2</Td>
        </TrWithoutDrawer>
      </Tbody>
    </Table>, root);
  });

  it('renders an empty table data that sets the column to the proper width for collapsible toggles', () => {
        expect(document.querySelectorAll('td')[0]).toHaveText('');
        expect(document.querySelectorAll('td')[0]).toHaveClass('pui-table--collapsible-toggle');
  });

  it('renders table data cells given as children after the table data spacer cell', () => {
    const tds = document.querySelectorAll('td');
    expect(tds).toHaveLength(3);
    expect(tds[1]).toHaveText('Content cell 1');
    expect(tds[2]).toHaveText('Content cell 2');
  });

  describe('when in a selectable context', () => {
    it('sets the column to the proper width for collapsible toggles', () => {
      ReactDOM.render(
          <SelectableContextWrapper identifiers={[]} onSelectionChange={() => {
          }}>
            <Table>
              <Tbody>
                <TrWithoutDrawer>
                  <Td>Content cell 1</Td>
                  <Td>Content cell 2</Td>
                </TrWithoutDrawer>
              </Tbody>
            </Table>
          </SelectableContextWrapper>, root);

      expect(document.querySelectorAll('td')[1]).toHaveText('');
      expect(document.querySelectorAll('td')[1]).toHaveClass('pui-table--collapsible-toggle');
    });
  });
});

describe('TrWithDrawer', () => {
  let ariaLabelCollapsed, ariaLabelExpanded, drawerContent, onExpandSpy, className;

  beforeEach(() => {
    onExpandSpy = jest.fn();
    ariaLabelCollapsed = 'show the thing';
    ariaLabelExpanded = 'hide the thing';
    className = 'my-special-class';
    drawerContent = <i>Drawer content</i>;

    ReactDOM.render(<Table><Tbody>
      <TrWithDrawer {...{ariaLabelCollapsed, ariaLabelExpanded, drawerContent, className, onExpand: onExpandSpy}}>
        <Td>Content cell 1</Td>
        <Td>Content cell 2</Td>
      </TrWithDrawer>
    </Tbody></Table>, root);
  });

  it('passes the className to the hidden drawer row', () => {
    const drawerTr = document.querySelectorAll('tr')[1];
    expect(drawerTr).toHaveClass(className);
  });

  it('renders a collapsible toggle for a row drawer in collapsed state', () => {
    const toggleTd = document.querySelectorAll('tr')[0].querySelectorAll('td')[0];
    expect(toggleTd).not.toHaveClass('active-indicator');
    expect(toggleTd.querySelector('button')).toHaveClass('pui-table--collapsible-btn');
    expect(toggleTd.querySelector('button')).toHaveAttr('aria-label', 'show the thing');
    expect(toggleTd.querySelector('button div')).toHaveClass('transition-transform');
    expect(toggleTd.querySelector('button div')).not.toHaveClass('rotate-qtr-turn');
    expect(toggleTd.querySelector('button div svg')).toHaveClass('icon-chevron_right');
  });

  it('renders table data cells given as children after the toggle cell', () => {
    const tds = document.querySelectorAll('tr')[0].querySelectorAll('td');
    expect(tds).toHaveLength(3);
    expect(tds[1]).toHaveText('Content cell 1');
    expect(tds[2]).toHaveText('Content cell 2');
  });

  it('renders hidden drawer row with drawer content in a single full-width cell', () => {
    const drawerTr = document.querySelectorAll('tr')[1];
    const drawerTds = drawerTr.querySelectorAll('td');
    expect(drawerTr).toHaveClass('border-top-0');
    expect(drawerTds).toHaveLength(1);
    expect(drawerTds[0]).toHaveAttr('colspan', '3');
    expect(drawerTds[0].querySelector('.pui-collapsible')).not.toHaveClass('in');
    expect(drawerTds[0].querySelector('.pui-collapsible')).toHaveAttr('aria-hidden', 'true');
    expect(drawerTds[0].querySelector('.pui-collapsible i')).toHaveText('Drawer content');
  });

  describe('when in a selectable context', () => {
    beforeEach(() => {
      ReactDOM.render(
          <SelectableContextWrapper identifiers={[]} onSelectionChange={() => {}}>
            <Table>
              <Tbody>
                <TrWithDrawer {...{
                  ariaLabelCollapsed,
                  ariaLabelExpanded,
                  drawerContent,
                  className,
                  onExpand: onExpandSpy
                }}>
                  <Td>Content cell 1</Td>
                  <Td>Content cell 2</Td>
                </TrWithDrawer>
              </Tbody>
            </Table>
          </SelectableContextWrapper>, root);
    });

    it('extends the drawer across the whole width of the table', () => {
      const drawerTr = document.querySelectorAll('tr')[1];
      const drawerTds = drawerTr.querySelectorAll('td');

      expect(drawerTds).toHaveLength(1);
      expect(drawerTds[0]).toHaveAttr('colspan', '4');
    });

    it('adds the active-indicator before the checkbox when expanded', () => {
      document.querySelector('td button').click();

      const tdContainingCheckbox = document.querySelectorAll('tr')[0].querySelectorAll('td')[0];
      expect(tdContainingCheckbox).toHaveClass('active-indicator');

      const toggleTd = document.querySelectorAll('tr')[0].querySelectorAll('td')[1];
      expect(toggleTd).not.toHaveClass('active-indicator');
    });
  });

  describe('when clicked to expand', () => {
    beforeEach(() => {
      document.querySelector('td button').click();
    });

    it('renders collapsible toggle as expanded', () => {
      const toggleTd = document.querySelectorAll('tr')[0].querySelectorAll('td')[0];
      expect(toggleTd).toHaveClass('active-indicator');
      expect(toggleTd.querySelector('.pui-table--collapsible-btn')).toHaveAttr('aria-label', 'hide the thing');
      expect(toggleTd.querySelector('.pui-table--collapsible-btn div')).toHaveClass('rotate-qtr-turn');
    });

    it('displays the drawer content', () => {
      const drawerTr = document.querySelectorAll('tr')[1];
      const drawer = drawerTr.querySelector('.pui-collapsible');
      expect(drawerTr).not.toHaveClass('border-top-0');
      expect(drawerTr).not.toHaveClass('display-none');
      expect(drawer).toHaveClass('in');
      expect(drawer.getAttribute('aria-hidden')).toBe('false');
    });

    it('calls the onExpand callback', () => {
      expect(onExpandSpy).toHaveBeenCalled();
    });

    describe('when clicked to collapse', () => {
      beforeEach(() => {
        onExpandSpy.mockClear();
        document.querySelector('td button').click();
      });

      it('renders collapsible toggle as collapsed', () => {
        const toggleTd = document.querySelectorAll('tr')[0].querySelectorAll('td')[0];
        expect(toggleTd).not.toHaveClass('active-indicator');
        expect(toggleTd.querySelector('.pui-table--collapsible-btn')).toHaveAttr('aria-label', 'show the thing');
        expect(toggleTd.querySelector('.pui-table--collapsible-btn div')).not.toHaveClass('rotate-qtr-turn');
      });

      it('hides the drawer content', () => {
        const drawerTr = document.querySelectorAll('tr')[1];
        const drawer = document.querySelectorAll('tr')[1].querySelector('.pui-collapsible');
        expect(drawer).not.toHaveClass('in');
        expect(drawer).toHaveAttr('aria-hidden');
        expect(drawerTr).toHaveClass('border-top-0');
        expect(drawerTr).toHaveClass('display-none');
      });

      it('does not call the onExpand callback', () => {
        expect(onExpandSpy).not.toHaveBeenCalled();
      });
    });
  });
});

describe('TrForBody', () => {
  beforeEach(() => {
    ReactDOM.render(
        <Table>
          <Tbody>
            <TrForBody>
              <Td>Content cell 1</Td>
              <Td>Content cell 2</Td>
            </TrForBody>
          </Tbody>
        </Table>, root);
  });

  it('renders a tr', () => {
    expect(document.querySelectorAll('tr')[0]).toExist();
  });

  it('renders only the children into the tr', () => {
    const tds = document.querySelectorAll('td');
    expect(tds).toHaveLength(2);
    expect(tds[0]).toHaveText('Content cell 1');
    expect(tds[1]).toHaveText('Content cell 2');
  });
});


describe.each([
    ['TrHeader', TrHeader],
    ['TrHeaderForDrawers', TrHeaderForDrawers]
])
('Contract for header of type "%s" in a selectable context',
    (_, HeaderComponent) => {
      const contextValue = {
        isInSelection: true,
        allAreSelected: () => false,
        someAreSelected: () => false,
        toggleSelectAll: () => {
        }
      };

      const selectableTable = (HeaderComponent) => (
          <SelectableContextWrapper identifiers={[]} onSelectionChange={() => {}}>
            <Table>
              <SelectionContext.Provider value={contextValue}>
                <Thead>
                  <HeaderComponent/>
                </Thead>
              </SelectionContext.Provider>
            </Table>
          </SelectableContextWrapper>);

      it('calls the context handler when clicked', () => {
        contextValue.toggleSelectAll = jest.fn();
        ReactDOM.render(selectableTable(HeaderComponent), root);

        document.querySelector('th .pui-checkbox input').click();
        expect(contextValue.toggleSelectAll).toHaveBeenCalledTimes(1);
        expect(contextValue.toggleSelectAll).toHaveBeenCalled();
      });

      it('is checked when allAreSelected', () => {
        contextValue.allAreSelected = () => true;
        ReactDOM.render(selectableTable(HeaderComponent), root);

        expect(document.querySelector('th .pui-checkbox input').checked).toBeTruthy();
      });

      it('is indeterminate when someAreSelected', () => {
        contextValue.someAreSelected = () => true;
        ReactDOM.render(selectableTable(HeaderComponent), root);

        expect(document.querySelector('th .pui-checkbox input').indeterminate).toBeTruthy();
      });

      it('is not checked when none are selected', () => {
        contextValue.allAreSelected = () => false;
        contextValue.someAreSelected = () => false;

        ReactDOM.render(selectableTable(HeaderComponent), root);

        expect(document.querySelector('th .pui-checkbox input').checked).toBeFalsy();
        expect(document.querySelector('th .pui-checkbox input').indeterminate).toBeFalsy();
      });

      describe('with select all (default)', () => {
        beforeEach(() => {
          ReactDOM.render(
              <SelectableContextWrapper identifiers={[]} onSelectionChange={() => {}}>
                <Table><Thead><HeaderComponent>
                  <Th>Content header 1</Th>
                  <Th>Content header 2</Th>
                </HeaderComponent></Thead></Table>
              </SelectableContextWrapper>, root);
        });

        it(
            'renders a table header with a selectAll checkbox that sets the column ' +
            'to the proper width for selectOne checkboxes',
            () => {
              expect(document.querySelectorAll('th')[0]).toHaveText('');
              expect(document.querySelectorAll('th')[0]).toHaveClass('pui-table--selectable-toggle');
              expect('th:nth-child(1) .pui-checkbox').toExist();
            }
        );
      });

      describe('withoutSelectAll', () => {
        beforeEach(() => {
          ReactDOM.render(
              <SelectableContextWrapper identifiers={[]} onSelectionChange={() => {}}>
                <Table><Thead><HeaderComponent withoutSelectAll>
                  <Th>Content header 1</Th>
                  <Th>Content header 2</Th>
                </HeaderComponent></Thead></Table>
              </SelectableContextWrapper>, root);
        });

        it(
            'renders a table header without a selectAll checkbox, that sets the column' +
            'to the proper width for collapsible toggles and selectOne checkboxes',
            () => {
              expect(document.querySelectorAll('th')[0]).toHaveText('');
              expect(document.querySelectorAll('th')[0]).toHaveClass('pui-table--selectable-toggle');
              expect('th:nth-child(1) .pui-checkbox').not.toExist();
            }
        );
      });
    });

describe.each([
  ['TrForBody', TrForBody, {}],
  ['TrWithDrawer', TrWithDrawer, {ariaLabelExpanded: '', ariaLabelCollapsed: ''}],
  ['TrWithoutDrawer', TrWithoutDrawer, {}]
])
('Contract for body table row of type "%s" in a selectable context', (_, TrComponentUnderTest, props)=>{
  describe('when in a selectable context', ()=> {
    const contextValue = {
      isInSelection: true,
      toggleSelected: jest.fn(),
      isSelected: ()=>false,
    };

    const selectableTable = () => (
        <SelectableContextWrapper identifiers={[]} onSelectionChange={() => {}}>
          <Table>
            <SelectionContext.Provider value={contextValue}>
              <Tbody>
                <TrComponentUnderTest {...props} identifier={'first row'}>
                  <Td>Content cell 1</Td>
                  <Td>Content cell 2</Td>
                </TrComponentUnderTest>
                <TrComponentUnderTest {...props} identifier={'second row'}>
                  <Td>Content cell 11</Td>
                  <Td>Content cell 22</Td>
                </TrComponentUnderTest>
              </Tbody>
            </SelectionContext.Provider>
          </Table>
        </SelectableContextWrapper>);

    describe('when the table row is selectable (default)', ()=> {
      it('prepends a td that will contain a checkbox', ()=>{
        ReactDOM.render(selectableTable(), root);

        const firstRow = document.querySelectorAll('tr:nth-child(1) td');
        const rowLength = firstRow.length;

        expect(firstRow[0]).toHaveText('');

        expect(firstRow[rowLength-2]).toHaveText('Content cell 1');
        expect(firstRow[rowLength-1]).toHaveText('Content cell 2');
      });

      it('calls the callback when the checkbox is clicked with the appropriate identifier', ()=>{
        ReactDOM.render(selectableTable(), root);

        let checkboxes = document.querySelectorAll('td .pui-checkbox input');
        checkboxes[0].click();
        checkboxes[1].click();
        checkboxes[0].click();

        expect(contextValue.toggleSelected).toHaveBeenCalledTimes(3);
        expect(contextValue.toggleSelected).toHaveBeenNthCalledWith(1, 'first row');
        expect(contextValue.toggleSelected).toHaveBeenNthCalledWith(2, 'second row');
        expect(contextValue.toggleSelected).toHaveBeenNthCalledWith(3, 'first row');
      });

      it('renders checked status when context shows that it should be checked', () => {
        contextValue.isSelected = jest.fn((identifier) => {
          switch (identifier) {
            case 'first row': return false;
            case 'second row': return true;

            default: fail('identifier not recognized');
          }
        });

        ReactDOM.render(selectableTable(), root);

        let checkboxes = document.querySelectorAll('td .pui-checkbox input');
        expect(checkboxes[0].checked).toBeFalsy();
        expect(checkboxes[0].indeterminate).toBeFalsy();
        expect(checkboxes[1].checked).toBeTruthy();
        expect(checkboxes[1].indeterminate).toBeFalsy();
      });
    });

    describe('when the table row is not selectable', ()=> {
      it('renders a blank space where the checkbox would have been', () => {
        ReactDOM.render(
            <SelectableContextWrapper identifiers={[]} onSelectionChange={() => {}}>
              <Table>
                <Tbody>
                  <TrComponentUnderTest {...props} notSelectable>
                    <Td>Content cell 1</Td>
                    <Td>Content cell 2</Td>
                  </TrComponentUnderTest>
                </Tbody>
              </Table>
            </SelectableContextWrapper>, root);

        const tds = document.querySelectorAll('tr:nth-child(1) td');
        const rowLength = tds.length;

        expect('.pui-checkbox input').not.toExist();
        expect(tds[0]).toHaveText('');
        expect(tds[rowLength-2]).toHaveText('Content cell 1');
        expect(tds[rowLength-1]).toHaveText('Content cell 2');
      });
    });
  });
});

describe('Selectable Table Integration', () => {
  const onSelectionChangeSpy = jest.fn();

  beforeEach(() => {
    ReactDOM.render(
        <SelectableContextWrapper identifiers={['GH', 'MH', 'AT']} onSelectionChange={onSelectionChangeSpy}>
          <Table>
            <Thead>
              <TrHeader>
                <Td>Name</Td>
                <Td>Surname</Td>
              </TrHeader>
            </Thead>
            <Tbody>
              <TrForBody identifier={'MH'}>
                <Td>Margaret</Td>
                <Td>Hamilton</Td>
              </TrForBody>
              <TrForBody identifier={'GH'}>
                <Td>Grace</Td>
                <Td>Hopper</Td>
              </TrForBody>
              <TrForBody identifier={'AT'}>
                <Td>Alan</Td>
                <Td>Turing</Td>
              </TrForBody>
            </Tbody>
          </Table>
        </SelectableContextWrapper>, root);
  });

  it('is called with the appropriate identifiers when selecting individual rows ', () => {
    let checkboxes = document.querySelectorAll('tbody input');

    checkboxes[0].click();
    expect(onSelectionChangeSpy).toHaveBeenCalledWith({'MH': true});

    checkboxes[1].click();
    expect(onSelectionChangeSpy).toHaveBeenCalledWith({'MH': true, 'GH': true});

    checkboxes[0].click();
    expect(onSelectionChangeSpy).toHaveBeenCalledWith({'GH': true});
  });

  it('is called with all identifiers when selecting all', () => {
    let selectAll = document.querySelector('thead input');

    selectAll.click();
    expect(onSelectionChangeSpy).toHaveBeenCalledWith({'MH': true, 'GH': true, 'AT': true});

    selectAll.click();
    expect(onSelectionChangeSpy).toHaveBeenCalledWith({});
  });
});