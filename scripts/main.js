export const moduleID = 'action-reaction-count';

import { ActionMaximum } from './action-advancement.js';

const lg = x => console.log(x);


Hooks.once('init', () => {
    for (const activityType of Object.values(CONFIG.DND5E.activityActivationTypes)) activityType.scalar = true;
    
    CONFIG.DND5E.advancementTypes.ActionMaximum = {
        documentClass: ActionMaximum,
        validItemTypes: new Set(['class'])
    };
});


Hooks.on('dnd5e.preUseActivity', (activity, usageConfig, dialogConfig, messageConfig) => {
    if (activity.activation.type !== 'action') return;

    const actor = fromUuidSync(activity.actor.uuid);
    const item = fromUuidSync(activity.item.uuid);
    if (!actor || !item) return;

    const actionCost = activity.activation.value;
    const itemActionType = getItemActionType(actor, item);
    const actorActionCount = actor.getFlag(moduleID, `${itemActionType}.count`);
    if (!actorActionCount) return;

    if (actionCost > actorActionCount) {
        ui.notifications.warn(`Not enough ${itemActionType} actions.`);
        return false;
    }

    return actor.setFlag(moduleID, `${itemActionType}.count`, actorActionCount - actionCost);


    function getItemActionType(actor, item) {
        if (game.combat.combatant.actorId !== actor.id) return 'reaction';

        const itemProps = Array.from(item.system.properties).map(p => CONFIG.DND5E.itemProperties[p]?.label.toLowerCase());

        if ((item.type === 'weapon' || item.type === 'feat') && itemProps.includes('attack')) return 'attack';
        if (item.type === 'spell' && itemProps.includes('spell')) return 'spell';
        return 'normal';
    }

});

Hooks.on('tidy5e-sheet.renderActorSheet', (app, html, appData) => {

    const actor = app.actor;
    const attributesTab = html?.querySelector('div.tidy-tab.attributes');
    const mainPanel = attributesTab?.querySelector(`${actor.type === 'character' ? 'section' : 'div'}.main-panel`);
    if (!mainPanel) return;
    if (mainPanel.querySelector('div.action-reaction-count-container')) {
        const actionsDiv = mainPanel.querySelector('div.action-reaction-count-container');
        actionsDiv.innerHTML = `
            <label>Actions</label>
            <div class="actions-container">
                <div class="action">
                    <label>Normal</label>
                    <div class="count-inputs">
                        <input type="number" min="0" step="1" name="flags.${moduleID}.normal.count"
                            value="${actor.getFlag(moduleID, 'normal.count') || 0}" placeholder="0" />
                         <span class="sep">/</span>
                        <input type="number" min="0" step="1" name="flags.${moduleID}.normal.max"
                            value="${actor.getFlag(moduleID, 'normal.max') || 3}" placeholder="0" ${actor.type === 'character' ? 'disabled' : ''} />
                    </div>
                </div>
                <div class="action">
                    <label>Reaction</label>
                    <div class="count-inputs">
                        <input type="number" min="0" step="1" name="flags.${moduleID}.reaction.count"
                            value="${actor.getFlag(moduleID, 'reaction.count') || 0}" placeholder="0" />
                        <span class="sep">/</span>
                        <input type="number" min="0" step="1" name="flags.${moduleID}.reaction.max"
                            value="${actor.getFlag(moduleID, 'reaction.max') || 1}" placeholder="0" ${actor.type === 'character' ? 'disabled' : ''} />
                    </div>
                </div>
                <div class="action">
                    <label>Attack</label>
                    <div class="count-inputs">
                        <input type="number" min="0" step="1" name="flags.${moduleID}.attack.count"
                            value="${actor.getFlag(moduleID, 'attack.count') || 0}" placeholder="0" />
                        <span class="sep">/</span>
                        <input type="number" min="0" step="1" name="flags.${moduleID}.attack.max"
                            value="${actor.getFlag(moduleID, 'attack.max') || 0}" placeholder="0" ${actor.type === 'character' ? 'disabled' : ''} />
                    </div>
                </div>
                <div class="action">
                    <label>Spell</label>
                    <div class="count-inputs">
                        <input type="number" min="0" step="1" name="flags.${moduleID}.spell.count"
                            value="${actor.getFlag(moduleID, 'spell.count') || 0}" placeholder="0" />
                        <span class="sep">/</span>
                        <input type="number" min="0" step="1" name="flags.${moduleID}.spell.max"
                            value="${actor.getFlag(moduleID, 'spell.max') || 0}" placeholder="0" ${actor.type === 'character' ? 'disabled' : ''} />
                    </div>
                </div>
            </div>
        `;

        return;
    };

    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('action-reaction-count-container');
    actionsDiv.innerHTML = `
        <label>Actions</label>
        <div class="actions-container">
            <div class="action">
                <label>Normal</label>
                <div class="count-inputs">
                    <input type="number" min="0" step="1" name="flags.${moduleID}.normal.count"
                        value="${actor.getFlag(moduleID, 'normal.count') || 0}" placeholder="0" />
                    <span class="sep">/</span>
                    <input type="number" min="0" step="1" name="flags.${moduleID}.normal.max"
                        value="${actor.getFlag(moduleID, 'normal.max') || 3}" placeholder="0" ${actor.type === 'character' ? 'disabled' : ''} />
                </div>
            </div>
            <div class="action">
                <label>Reaction</label>
                <div class="count-inputs">
                    <input type="number" min="0" step="1" name="flags.${moduleID}.reaction.count"
                        value="${actor.getFlag(moduleID, 'reaction.count') || 0}" placeholder="0" />
                    <span class="sep">/</span>
                    <input type="number" min="0" step="1" name="flags.${moduleID}.reaction.max"
                        value="${actor.getFlag(moduleID, 'reaction.max') || 1}" placeholder="0" ${actor.type === 'character' ? 'disabled' : ''} />
                </div>
            </div>
            <div class="action">
                <label>Attack</label>
                <div class="count-inputs">
                    <input type="number" min="0" step="1" name="flags.${moduleID}.attack.count"
                        value="${actor.getFlag(moduleID, 'attack.count') || 0}" placeholder="0" />
                    <span class="sep">/</span>
                    <input type="number" min="0" step="1" name="flags.${moduleID}.attack.max"
                        value="${actor.getFlag(moduleID, 'attack.max') || 0}" placeholder="0" ${actor.type === 'character' ? 'disabled' : ''} />
                </div>
            </div>
            <div class="action">
                <label>Spell</label>
                <div class="count-inputs">
                    <input type="number" min="0" step="1" name="flags.${moduleID}.spell.count"
                        value="${actor.getFlag(moduleID, 'spell.count') || 0}" placeholder="0" />
                    <span class="sep">/</span>
                    <input type="number" min="0" step="1" name="flags.${moduleID}.spell.max"
                        value="${actor.getFlag(moduleID, 'spell.max') || 0}" placeholder="0" ${actor.type === 'character' ? 'disabled' : ''} />
                </div>
            </div>
        </div>
    `;

    mainPanel.prepend(actionsDiv);
});

Hooks.on('dnd5e.postCombatRecovery', async (combatant, periods, message) => {
    if (!periods.includes('turnStart')) return;
    const actor = combatant.actor;
    if (!actor) return;

    const actionCountTypes = ['normal', 'reaction', 'attack', 'spell'];
    for (const actionCountType of actionCountTypes) {
        await actor.setFlag(moduleID, `${actionCountType}.count`, actor.getFlag(moduleID, `${actionCountType}.max`));
    }
});
