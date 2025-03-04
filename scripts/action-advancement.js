import { moduleID } from './main.js';

const lg = x => console.log(x);


export class ActionMaximum extends dnd5e.documents.advancement.Advancement {
    static get metadata() {
        return foundry.utils.mergeObject(super.metadata, {
            dataModels: {
                configuration: ActionMaximumData,
                value: ActionMaximumData
            },
            order: 20,
            title: 'Action Maximum',
            apps: {
                config: ActionMaximumConfig,
                flow: ActionMaximumFlow
            }
        });
    }

    async apply(level, data) {
        this.actor.updateSource({
            [`flags.${moduleID}.${this.configuration.actionType}.max`]: this.actor.getFlag(moduleID, `${this.configuration.actionType}.max`) + this.configuration.increase
        });
        this.updateSource({
            value: {
                actionType: this.configuration.actionType,
                increase: this.configuration.increase
            }
        });
    }

    async restore(level, data) {
        this.apply(level,data);
    }

    reverse(level) {
        this.actor.updateSource({
            [`flags.${moduleID}.${this.value.actionType}.max`]: this.actor.getFlag(moduleID, `${this.value.actionType}.max`) - this.value.increase
        })
        this.updateSource({value: null});
    }
}

class ActionMaximumData extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            actionType: new foundry.data.fields.StringField(),
            increase: new foundry.data.fields.NumberField({ integer: true, min: 1, initial: 1 })
        }
    }
}


class ActionMaximumConfig extends dnd5e.applications.advancement.AdvancementConfig {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: `modules/${moduleID}/templates/action-advancement-config.hbs`
        });
    }

    getData() {
        const context = super.getData();
        context.actionTypes = {
            normal: 'Normal',
            reaction: 'Reaction',
            attack: 'Attack',
            spell: 'Spell'
        };

        return context;
    }
}

class ActionMaximumFlow extends dnd5e.applications.advancement.AdvancementFlow {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            template: `modules/${moduleID}/templates/action-advancement-flow.hbs`
        });
    }
}
