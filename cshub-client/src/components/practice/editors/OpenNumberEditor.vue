<template>
    <v-row>
        <v-col cols="6">
            <v-form @submit="submit">
                <v-btn color="primary" @click="submit">Submit</v-btn>
                <v-textarea
                    v-model="question"
                    v-validate="'required|min:2'"
                    :error-messages="errors.collect('question')"
                    :hide-details="!errors.has('question')"
                    name="question"
                    filled
                    required
                    auto-grow
                    rows="2"
                    label="Question"
                    value="Bla"
                    class="mb-4 mt-4"
                ></v-textarea>
                <v-textarea
                    v-model="explanation"
                    v-validate="'required|min:2'"
                    :error-messages="errors.collect('explanation')"
                    :hide-details="!errors.has('explanation')"
                    required
                    name="explanation"
                    filled
                    auto-grow
                    rows="3"
                    label="Explanation"
                    value="Bla"
                    class="mb-4"
                ></v-textarea>
                <v-text-field
                    v-model="answer"
                    v-validate="'required|decimal'"
                    :hide-details="!errors.has('answer')"
                    label="Answer"
                    filled
                    type="number"
                    name="answer"
                    :error-messages="errors.collect('answer')"
                    class="mb-4"
                >
                </v-text-field>
                <v-text-field
                    v-model="precision"
                    v-validate="'required|min_value:-10|max_value:10|numeric'"
                    label="Precision"
                    outlined
                    type="number"
                    name="precision"
                    hint="The precision is the amount of numbers after the decimal point. If you put in 0 the precision will be 1, 2 will be 0.01, -2 will be 100"
                    :error-messages="errors.collect('precision')"
                >
                </v-text-field>
            </v-form>
        </v-col>
        <v-col cols="6">
            <OpenNumberViewer
                :question="question"
                :explanation="explanation"
                :answer="answer"
                :precision="precision"
            ></OpenNumberViewer>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

import { ApiWrapper } from "../../../utilities";
import { QuestionType } from "../../../../../cshub-shared/src/entities/question";
import { AddQuestion, EditQuestion } from "../../../../../cshub-shared/src/api-calls/endpoints/question";
import { FullQuestion } from "../../../../../cshub-shared/src/api-calls/endpoints/question/models/FullQuestion";
import OpenNumberViewer from "../viewers/OpenNumberViewer.vue";
import { EventBus, QUESTIONS_CHANGED } from "../../../utilities/EventBus";
import { uiState } from "../../../store";

@Component({
    name: OpenNumberEditor.name,
    components: { OpenNumberViewer },
    inject: ["$validator"]
})
export default class OpenNumberEditor extends Vue {
    @Prop({
        required: false
    })
    private propQuestion?: string;

    @Prop({
        required: false
    })
    private propExplanation?: string;

    @Prop({
        required: false
    })
    private propAnswer?: number;

    @Prop({
        required: false
    })
    private propPrecision?: number;

    @Prop({
        required: true
    })
    private isEditing!: false | number;

    private question = this.propQuestion || "";
    private explanation = this.propExplanation || "";

    private answer: number = this.propAnswer || 0;
    private precision: number = this.propPrecision || 1;

    private async submit() {
        let valid = await this.$validator.validateAll();

        if (valid) {
            const question: FullQuestion = {
                question: this.question,
                explanation: this.explanation,
                type: QuestionType.OPENNUMBER,
                number: this.answer,
                precision: this.precision
            };

            if (this.isEditing) {
                await ApiWrapper.put(new EditQuestion(question, this.isEditing));
            } else {
                await ApiWrapper.post(new AddQuestion(question, +this.$route.params.hash));
            }

            uiState.setNotificationDialog({
                header: "Saved",
                text: "Saved question, it will be reviewed by an admin soon!",
                on: true
            });

            this.answer = 0;
            this.question = "";
            this.explanation = "";
            this.precision = 0.01;

            EventBus.$emit(QUESTIONS_CHANGED);
        }
    }
}
</script>

<style>
.dynamic-question-textarea .v-text-field__slot {
    margin-right: 0 !important;
}

.questionContent p {
    margin-bottom: 0 !important;
}
</style>
