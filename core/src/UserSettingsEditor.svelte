<script>
  import { createEventDispatcher, getContext } from 'svelte';
  import { GenericHelpers } from './utilities/helpers';
  import { KEYCODE_ENTER, KEYCODE_SPACE, KEYCODE_ARROW_UP, KEYCODE_ARROW_DOWN } from './utilities/keycode.js';
  export let userSettingGroup;
  export let storedUserSettingData;
  const dispatch = createEventDispatcher();
  let getTranslation = getContext('getTranslation');
  let selectedLanguageLabel;
  export let isComboOpen;

  export function updateSettingsObject() {
    dispatch('updateSettingsObject', { storedUserSettingData });
  }

  export const closeDropDown = () => {
    closeAllCombos();
  };

  function closeAllCombos(self) {
    document.querySelectorAll('.lui-usersettings-content .fd-popover__control').forEach((elem) => {
      setExpandedState(elem, false);
    });
  }

  function closest(element, selector, max) {
    if (element && max > 0) {
      return element.matches(selector) ? element : closest(element.parentNode, selector, max - 1);
    } else {
      return undefined;
    }
  }

  function toggleOptions(event, editable) {
    let self = closest(event.target, '.fd-popover__control', 20);
    let currentState = self.getAttribute('aria-expanded') === 'true';

    if (editable || editable === undefined) {
      closeAllCombos(self);
      setExpandedState(self, !currentState);
    }
  }

  function setExpandedState(self, value) {
    const indicatorBtn = self.querySelector('.lui-activate-dropdown');
    const optionsPopover = self.parentNode.querySelector('.fd-popover__body');
    const optionsSelectControl = self.parentNode.querySelector('.fd-select__control');
    self.setAttribute('aria-expanded', value);
    optionsPopover.setAttribute('aria-hidden', !value);
    optionsSelectControl.setAttribute('aria-expanded', value);
    indicatorBtn.setAttribute('aria-expanded', value);
    isComboOpen = value;
  }

  function updateComboBox(key, option, optionIndex) {
    selectedLanguageLabel = optionIndex;
    storedUserSettingData[userSettingGroup[0]][key] = option.value || option;
  }

  function updateEnumButton(key, option) {
    document.querySelectorAll('.enum-buttons-container-' + key + ' button').forEach((button) => {
      const buttonId = button.getAttribute('id');
      const optionId = `lui-us-enum_button_${key}_option`;
      buttonId === optionId
        ? button.classList.add('fd-button--emphasized')
        : button.classList.remove('fd-button--emphasized');
    });
    storedUserSettingData[userSettingGroup[0]][key] = option.value || option;
  }

  function getLabelForValue(optionValue, options) {
    let label;
    if (Array.isArray(options)) {
      for (let i = 0; i < options.length; i++) {
        if (GenericHelpers.isObject(options[i])) {
          if (options[i].value && options[i].value === optionValue) {
            label = options[i].label;
            selectedLanguageLabel = i;
            break;
          }
        } else {
          label = optionValue;
          selectedLanguageLabel = options.indexOf(optionValue);
          break;
        }
      }
      return $getTranslation(label);
    }
  }

  function getLabel(optionsEntry) {
    return $getTranslation(GenericHelpers.isObject(optionsEntry) ? optionsEntry.label : optionsEntry);
  }

  function getEnumButtonId(prefix, key, option) {
    return GenericHelpers.isObject(option) ? `${prefix}_${key}_${option.value}` : `${prefix}_${key}_${option}`;
  }

  export function handleKeyListDropdown(event, key, elementIndex, schemaItem) {
    let thisDropdown = closest(event.target, '.lui-anchor-node', 20);
    const list = document.getElementById(`fd-form-input-dropdown-${elementIndex}`).children;
    let chosenElementIndex = -1;
    [...list].forEach((node, index) => {
      if (node.classList.contains('is-focus')) {
        chosenElementIndex = index;
      }
    });

    if (isComboOpen) {
      if (event.keyCode === KEYCODE_ARROW_UP && event.altKey) {
        thisDropdown.click();
        thisDropdown.focus();
      }
      if (event.keyCode === KEYCODE_ARROW_DOWN && !event.altKey) {
        if (chosenElementIndex === -1) {
          chosenElementIndex = 0;
          list.item(chosenElementIndex).classList.add('is-focus');
          return;
        }
        if (chosenElementIndex < schemaItem.options.length - 1) {
          list.item(chosenElementIndex).classList.remove('is-focus');
          chosenElementIndex += 1;
          list.item(chosenElementIndex).classList.add('is-focus');
        }
      }
      if (event.keyCode === KEYCODE_ARROW_UP && !event.altKey) {
        if (chosenElementIndex === -1) {
          chosenElementIndex = chosenElementIndex.length - 1;
          list.item(chosenElementIndex).classList.add('is-focus');
          return;
        }
        if (chosenElementIndex > 0 && chosenElementIndex < schemaItem.options.length) {
          list.item(chosenElementIndex).classList.remove('is-focus');
          chosenElementIndex -= 1;
          list.item(chosenElementIndex).classList.add('is-focus');
        }
      }
      if (event.keyCode === KEYCODE_ENTER || event.keyCode === KEYCODE_SPACE) {
        updateComboBox(key, schemaItem.options[chosenElementIndex], chosenElementIndex);
      }
    } else {
      thisDropdown.focus();
      if (event.keyCode === KEYCODE_ARROW_DOWN && event.altKey) {
        thisDropdown.click();
      }
      if (event.keyCode === KEYCODE_ARROW_DOWN && !event.altKey) {
        if (chosenElementIndex < schemaItem.options.length - 1) {
          updateComboBox(key, schemaItem.options[chosenElementIndex + 1], chosenElementIndex + 1);
        }
      }
      if (event.keyCode === KEYCODE_ARROW_UP && !event.altKey) {
        if (chosenElementIndex > 0 && chosenElementIndex < schemaItem.options.length) {
          updateComboBox(key, schemaItem.options[chosenElementIndex - 1], chosenElementIndex - 1);
        }
      }
    }
  }

  export function keyPressDropdownNode(event) {
    if (isComboOpen) {
      let dropdownHTMLElement = closest(event.target, '.fd-popover', 20);
      dropdownHTMLElement.blur();
      if (event.keyCode === KEYCODE_SPACE || event.keyCode === KEYCODE_ENTER) {
        event.target.click();
        closeAllCombos();
        setTimeout(() => {
          dropdownHTMLElement.focus();
        }, 0);
      }
    }
  }

  /*to display a language on first load of the User Settings dialog*/
  getLabelForValue();
</script>

<svelte:window on:click={closeAllCombos} on:blur={closeAllCombos} />
<div class="lui-usersettings-content">
  {#if userSettingGroup && userSettingGroup[0] && userSettingGroup[1]}
    {#if userSettingGroup[1].settings}
      <div class="fd-page__content">
        <div class="fd-container fd-form-layout-grid-container">
          {#each Object.entries(userSettingGroup[1].settings) as [key, schemaItem], index}
            <div class="fd-row">
              <div class="fd-col fd-col--4">
                <label class="fd-form-label" for="fd-form-input-{index}">{$getTranslation(schemaItem.label)}: </label>
              </div>
              <div class="fd-col fd-col--8">
                {#if schemaItem.type === 'string'}
                  {#if schemaItem.isEditable || schemaItem.isEditable === undefined}
                    <input
                      class="fd-input fd-input--compact"
                      type="text"
                      aria-label="Image label"
                      placeholder={$getTranslation(schemaItem.placeholder)}
                      data-testid="lui-us-input{index}"
                      id="fd-form-input-{index}"
                      bind:value={storedUserSettingData[userSettingGroup[0]][key]}
                      disabled={schemaItem.isEditable === undefined || schemaItem.isEditable ? false : true}
                    />
                  {:else}
                    <div
                      class="fd-text"
                      data-testid="lui-us-input{index}"
                      id="fd-form-input-{index}"
                      disabled={schemaItem.isEditable === undefined || schemaItem.isEditable ? false : true}
                    >
                      {storedUserSettingData[userSettingGroup[0]][key]}
                    </div>
                  {/if}
                {/if}
                {#if schemaItem.type === 'enum' && (schemaItem.style === undefined || schemaItem.style === 'list')}
                  <div class="fd-form-item">
                    <div class="fd-popover">
                      <!-- svelte-ignore a11y-click-events-have-key-events -->
                      <!-- svelte-ignore a11y-no-static-element-interactions -->
                      <div
                        class="fd-popover__control"
                        aria-expanded="false"
                        aria-haspopup="true"
                        on:click|stopPropagation={() => toggleOptions(event, schemaItem.isEditable)}
                      >
                        <div class="fd-select fd-select--compact">
                          <button
                            tabindex="0"
                            aria-expanded="false"
                            aria-haspopup="listbox"
                            aria-label="Language"
                            class="fd-select__control lui-anchor-node"
                            data-testid="lui-us-{schemaItem.type}-{index}"
                            id="fd-form-input-{index}"
                            on:keydown={(event) => handleKeyListDropdown(event, key, index, schemaItem)}
                          >
                            <span
                              class="fd-select__text-content"
                              data-testid="lui-us-input{index}"
                              disabled={schemaItem.isEditable === undefined || schemaItem.isEditable ? false : true}
                              >{getLabelForValue(storedUserSettingData[userSettingGroup[0]][key], schemaItem.options)}
                            </span>
                            <span class="fd-button fd-button--transparent fd-select__button lui-activate-dropdown">
                              <i class="sap-icon--slim-arrow-down" />
                            </span>
                          </button>
                        </div>
                      </div>
                      <div
                        class="fd-popover__body fd-popover__body--no-arrow fd-popover__body--dropdown fd-popover__body--dropdown-fill"
                        aria-hidden="true"
                      >
                        {#if Array.isArray(schemaItem.options)}
                          <ul
                            class="fd-list fd-list--compact fd-list--dropdown"
                            id="fd-form-input-dropdown-{index}"
                            role="listbox"
                          >
                            {#each schemaItem.options as option, optionIndex}
                              <li
                                role="option"
                                class="fd-list__item"
                                class:is-selected={selectedLanguageLabel === optionIndex}
                                class:is-focus={selectedLanguageLabel === optionIndex}
                                data-testid="lui-us-option{index}_{optionIndex}"
                                aria-selected={selectedLanguageLabel === optionIndex}
                                on:click={() => updateComboBox(key, option, optionIndex)}
                                on:keydown={(event) => keyPressDropdownNode(event)}
                                tabindex="0"
                              >
                                <span class="fd-list__title">{getLabel(option)}</span>
                              </li>
                            {/each}
                          </ul>
                        {/if}
                      </div>
                    </div>
                  </div>
                {/if}
                {#if schemaItem.type === 'enum' && schemaItem.style === 'button' && Array.isArray(schemaItem.options)}
                  <div class="fd-form-item">
                    <div class="fd-segmented-button enum-buttons-container-{key}" role="group" aria-label="Group label">
                      {#each schemaItem.options as option, optionIndex}
                        <button
                          class="lui-fd-enum-button fd-button fd-button--compact {storedUserSettingData[
                            userSettingGroup[0]
                          ][key] === (option.value || option)
                            ? 'is-selected'
                            : ''}"
                          on:click={() => updateEnumButton(key, option)}
                          id={getEnumButtonId('lui-us-enum_button', key, option)}
                          data-testid={getEnumButtonId('lui-us-enum_button', key, option)}
                          disabled={schemaItem.isEditable === undefined || schemaItem.isEditable ? false : true}
                        >
                          {getLabel(option)}
                        </button>
                      {/each}
                    </div>
                  </div>
                {/if}
                {#if schemaItem.type === 'boolean' && (!schemaItem.style || schemaItem.style === 'switch')}
                  <label class="fd-switch fd-switch--compact" data-testid="lui-us-label-switch_{key}">
                    <span class="fd-switch__control">
                      <input
                        class="fd-switch__input"
                        type="checkbox"
                        aria-labelledby="label1"
                        data-testid="lui-us-checkbox-switch_{key}"
                        disabled={schemaItem.isEditable === undefined || schemaItem.isEditable ? false : true}
                        bind:checked={storedUserSettingData[userSettingGroup[0]][key]}
                      />
                      <div class="fd-switch__slider">
                        <div class="fd-switch__track"><span class="fd-switch__handle" role="presentation" /></div>
                      </div>
                    </span>
                  </label>
                {/if}
                {#if schemaItem.type === 'boolean' && schemaItem.style === 'checkbox'}
                  <input
                    type="checkbox"
                    class="fd-checkbox"
                    disabled={schemaItem.isEditable === undefined || schemaItem.isEditable ? false : true}
                    bind:checked={storedUserSettingData[userSettingGroup[0]][key]}
                  />
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .lui-usersettings-content .fd-row {
    min-height: 2rem; /*required for empty labels to not shrink*/
  }

  .lui-usersettings-content .fd-container .fd-row .fd-col {
    overflow: visible; /*make dropdown visible above the text below*/
  }

  .lui-usersettings-content .fd-col--8 .fd-form-label {
    float: left;
  }

  /*Vertical alignement for mobile label/input view*/
  @media (max-width: 600px) {
    .lui-usersettings-content .fd-col--4,
    .lui-usersettings-content .fd-col--8 {
      min-width: 100%;
      max-width: 100%;
    }
    .lui-usersettings-content .fd-col--4 .fd-form-label {
      float: left;
    }
  }

  /*Override of FDF Styles margin v0.20.0 due to the row width*/
  .fd-row .fd-col .fd-select__control.lui-anchor-node {
    margin: 0;
  }
  .fd-select__control:global(.lui-anchor-node[aria-expanded='true']:focus) {
    outline: none;
  }

  .fd-segmented-button {
    width: fit-content;
  }
</style>
