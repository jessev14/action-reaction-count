const moduleID = 'action-reaction-count';

const lg = x => console.log(x);


Hooks.once('init', () => {
    libWrapper.register(moduleID, 'CONFIG.Item.documentClass.prototype.use', newUse, 'MIXED');
});


Hooks.on('renderActorSheet5e', (app, [html], appData) => {
    const actor = app.object;
    const isPC = actor.type === 'character';
    const injectLocation = html.querySelector(isPC ? 'ul.resources' : 'div.counters');

    const arUl = document.createElement('ul');
    arUl.classList.add('resources');
    for (const arType of ['actions', 'reactions']) {
        const li = document.createElement('li');
        li.classList.add('resource');
        li.innerHTML = `
            <h4 class="resource-name">
                <input type="text" value="${arType}" disabled>
            </h4>
            <div class="resource-value multiple">
                <input class="res-value" type="text" name="flags.${moduleID}.${arType}.value" value="${actor.flags[moduleID]?.[arType]?.value || (arType === 'actions' ? 3 : 1)}"  data-dtype="Number" maxlength="3">
                <span class="sep"> / </span>
                <input class="res-max" type="text" name="flags.${moduleID}.${arType}.max" value="${actor.flags[moduleID]?.[arType]?.max || (arType === 'actions' ? 3 : 1)}" data-dtype="Number" maxlength="3">
            </div>
        `;
        arUl.appendChild(li);
    }
    injectLocation.after(arUl);
});

Hooks.on('updateCombat', (combat, diff, options, userID) => {
    const { combatant } = combat;
    const { actor } = combatant;
    if (!actor.isOwner || game.user.id !== userID) return;

    const maxActions = actor.getFlag(moduleID, 'actions.max');
    const maxReactions = actor.getFlag(moduleID, 'reactions.max');

    return actor.update({
        [`flags.${moduleID}.actions.value`]: maxActions,
        [`flags.${moduleID}.reactions.value`]: maxReactions
    });
});

Hooks.on('controlToken', () => {
    updateTray();
});

Hooks.on('preUpdateActor', (actor, diff, options, userID) => {
    updateTray();
});

async function updateTray() {
    await new Promise(resolve => setTimeout(resolve, 50));

    const actionPack = document.querySelector('#action-pack');
    const actorsDiv = actionPack.querySelector('div.action-pack__container');
    if (!actorsDiv) return;

    for (const actorDiv of actorsDiv.querySelectorAll('div.action-pack__actor')) {
        const uuid = actorDiv.dataset.actorUuid;
        const actor = fromUuidSync(uuid);
        if (!actor) continue;
    
        if (actorDiv.querySelector(`div#${moduleID}-actions`) || actorDiv.querySelector(`div#${moduleID}-reactions`)) continue;

        const {value: actionValue = 3, max: actionMax = 3 } = actor.getFlag(moduleID, 'actions') || {};
        let actionDots = ``;
        for (let i = 0; i < actionMax; i++) {
            if (i <= actionValue) actionDots += `<div class="dot"></div>`;
            else actionDots += `<div class="dot empty"></div>`
        }
        const actions = document.createElement('div');
        actions.id = `${moduleID}-actions`;
        actions.classList.add('flexrow');
        actions.innerHTML = `
            <h3>
                <span>Actions</span>
                <div class="group-dots">
                    ${actionDots}
                </div>
            </h3>
            <div class="group-uses">${actionValue}/${actionMax}</div>
        `;


        const {value: reactionValue = 1, max: reactionMax = 1 } = actor.getFlag(moduleID, 'reactions') || {};
        let reactionDots = ``;
        for (let i = 0; i < reactionMax; i++) {
            if (i <= reactionValue) reactionDots += `<div class="dot"></div>`;
            else reactionDots += `<div class="dot empty"></div>`
        }
        const reactions = document.createElement('div');
        reactions.classList.add('flexrow');
        reactions.id = `${moduleID}-reactions`;
        reactions.innerHTML = `
            <h3>
                <span>Reactions</span>
                <div class="group-dots">
                    ${reactionDots}
                </div>
            </h3>
            <div class="group-uses">${reactionValue}/${reactionMax}</div>
        `;

        const header = actorDiv.querySelector('h1');
        header.after(reactions);
        header.after(actions);
    }
}

async function newUse(wrapped, config = {}, options = {}) {
    const { actor } = this;

    const actionType = this.system.activation.type === 'action' ? 'actions' : 'reactions';
    const actionCost = this.system.activation.cost;

    const currentActionValue = actor.getFlag(moduleID, `${actionType}.value`);
    let newActionValue = currentActionValue - actionCost;
    if (newActionValue < 0) {
        const overrideChoice = await Dialog.wait({
            title: `Insufficient ${actionType}`,
            content: `You do not have enough ${actionType}. Continue?`,
            buttons: {
                yes: {
                    label: 'Yes'
                },
                no: {
                    label: 'No'
                }
            },
            default: 'no'
        });
        if (overrideChoice === 'no') return;
    }

    newActionValue = Math.max(0, newActionValue);
    await actor.setFlag(moduleID, `${actionType}.value`, newActionValue);

    return wrapped(config, options);
}
