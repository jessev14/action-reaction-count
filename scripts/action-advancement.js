import { moduleID } from './main.js';

const lg = x => console.log(x);


export class ActionAdvancement extends dnd5e.documents.advancement.AbilityScoreImprovementAdvancement {
    static get metadata() {
        return foundry.utils.mergeObject(super.metadata, {
            name: 'ActionAdvancement',
            title: 'My Custom Advancement'
        })
    }
}


class ActionAdvancementConfig extends dnd5e.applications.advancement.AdvancementConfig {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: `modules/${moduleID}/templates/action-advancement-config.hbs`
        });
    }

}

class ActionAdvancementFlow extends dnd5e.applications.advancement.AdvancementFlow {
    constructor() {
        super();
    }
}
