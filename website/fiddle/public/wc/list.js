const template = document.createElement('template');
template.innerHTML = `
    <style>
      .editable-list {
          color: #2b2b2b;
          font-family: sans-serif;
          margin: 0 auto;
          padding-left:20px; 
          padding-top: 20px;
      }

    </style>
    <editable-list
        title="Editable List"
        list-item-0="First item on the list"
        list-item-1="Second item on the list"
        list-item-2="Third item on the list"
        list-item-3="Fourth item on the list"
        list-item-4="Fifth item on the list"
        listItem="This will not appear"
        add-item-text="Add new list item:"
    >
    </editable-list>
`;

export default class ListWC extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.$editable_list = this.shadowRoot.querySelector('editable-list');

    const editableListContainer = document.createElement('div');
    editableListContainer.classList.add('editable-list');

    // get attribute values from getters
    const title = this.escape(this.title);
    const addItemText = this.escape(this.addItemText);
    const listItems = this.items.map((item) => this.escape(item));

    editableListContainer.innerHTML = `
        <style>
          li, div > div {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .icon {
            background-color: transparent;
            border: none;
            cursor: pointer;
            float: right;
            font-size: 1.8rem;
            margin-right: 20px;
          }
          
          .item-list{
            padding: 0px;
          }
 
          .item-list-element{
            display: inline-flex;
            width: 100%;
            justify-content: flex-start;
          }
          
        </style>
        <h3>${title}</h3>
        <ul class="item-list">
          ${listItems
            .map(
              (item) => `
            <li class="item-list-element">
              <button class="editable-list-remove-item icon">&ominus;</button>
              ${item}
            </li>
          `
            )
            .join('')}
        </ul>
        <div class="item-list-element">
          <label >${addItemText}</label>
          <input class="add-new-list-item-input" type="text" style="margin-left:10px;"></input>
          <button class="editable-list-add-item icon"  style="margin-left:5px;">&oplus;</button>
        </div>
      `;

    // binding methods
    this.addListItem = this.addListItem.bind(this);
    this.handleRemoveItemListeners = this.handleRemoveItemListeners.bind(this);
    this.removeListItem = this.removeListItem.bind(this);

    // appending the container to the shadow DOM
    shadow.appendChild(editableListContainer);
  }

  // add items to the list
  addListItem(e) {
    const textInput = this.shadowRoot.querySelector('.add-new-list-item-input');

    if (textInput.value) {
      const li = document.createElement('li');
      li.classList.add('item-list-element');
      li.innerHTML = '<button class="editable-list-remove-item icon">&ominus;</button>' + this.escape(textInput.value);
      let button = li.querySelector('button');
      this.itemList.appendChild(li);
      this.handleRemoveItemListeners([button]);
      textInput.value = '';
    }
  }

  escape(text) {
    let tagsToReplace = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
    };

    return text.replace(/[&<>]/g, function (tag) {
      return tagsToReplace[tag] || tag;
    });
  }

  // fires after the element has been attached to the DOM
  connectedCallback() {
    const removeElementButtons = [...this.shadowRoot.querySelectorAll('.editable-list-remove-item')];
    const addElementButton = this.shadowRoot.querySelector('.editable-list-add-item');

    this.itemList = this.shadowRoot.querySelector('.item-list');

    this.handleRemoveItemListeners(removeElementButtons);
    addElementButton.addEventListener('click', this.addListItem, false);
  }

  get title() {
    return this.$editable_list.getAttribute('title') || '';
  }

  get addItemText() {
    return this.$editable_list.getAttribute('add-item-text') || '';
  }

  get items() {
    const items = [];

    [...this.$editable_list.attributes].forEach((attr) => {
      if (attr.name.includes('list-item')) {
        items.push(attr.value);
      }
    });

    return items;
  }

  handleRemoveItemListeners(arrayOfElements) {
    arrayOfElements.forEach((element) => {
      element.addEventListener('click', this.removeListItem, false);
    });
  }

  removeListItem(e) {
    e.target.parentNode.remove();
  }
}
