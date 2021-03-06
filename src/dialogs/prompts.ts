import {
    AttachmentPrompt,
    ChoicePrompt,
    ComponentDialog,
    ConfirmPrompt,
    DateTimePrompt,
    NumberPrompt,
    TextPrompt,
    WaterfallDialog,
    WaterfallStepContext } from 'botbuilder-dialogs';
import utilities from '../resources/utilities';

const choices = {
    text: 'Text',
    number: 'Number',
    dateTime: 'DateTime',
    confirm: 'Confirm',
    attachment: 'Attachment',
    back: 'Back',
};

const dialogIds = {
    PROMPTS_MAIN: 'promptMainDialog',
    TEXT: 'textDialog',
    NUMBER: 'numberDialog',
    DATETIME: 'dateTimeDialog',
    CONFIRM: 'confirmDialog',
    ATTACHMENT: 'attachmentDialog',
};

const promptIds = {
    CHOICE: 'choicePrompt',
    TEXT: 'textPrompt',
    NUMBER: 'numberPrompt',
    DATETIME: 'dateTimePrompt',
    CONFIRM: 'confirmPrompt',
    ATTACHMENT: 'attachmentPrompt',
};

export class PromptsDialog extends ComponentDialog {

    constructor(dialogId: string) {
        super(dialogId);

        // validate what was passed in
        if (!dialogId) { throw new Error('Missing parameter.  dialogId is required'); }

        // Define main conversation flow
        this.addDialog(new WaterfallDialog(dialogIds.PROMPTS_MAIN, [
            this.promptForOptionSelection.bind(this),
            this.directToTest.bind(this),
            this.end.bind(this),
        ]));

        // Define conversation flow for text test
        this.addDialog(new WaterfallDialog(dialogIds.TEXT, [
            this.startText.bind(this),
            this.endText.bind(this),
            this.end.bind(this),
        ]));

        // Define conversation flow for number test
        this.addDialog(new WaterfallDialog(dialogIds.NUMBER, [
            this.startNumber.bind(this),
            this.endNumber.bind(this),
            this.end.bind(this),
        ]));

        // Define conversation flow for dateTime test
        this.addDialog(new WaterfallDialog(dialogIds.DATETIME, [
            this.startDateTime.bind(this),
            this.endDateTime.bind(this),
            this.end.bind(this),
        ]));

        // Define conversation flow for confirm test
        this.addDialog(new WaterfallDialog(dialogIds.CONFIRM, [
            this.startConfirm.bind(this),
            this.endConfirm.bind(this),
            this.end.bind(this),
        ]));

        // Define conversation flow for attachment test
        this.addDialog(new WaterfallDialog(dialogIds.ATTACHMENT, [
            this.startAttachment.bind(this),
            this.endAttachment.bind(this),
            this.end.bind(this),
        ]));

        // define dialogs to be used
        this.addDialog(new ChoicePrompt(promptIds.CHOICE));
        this.addDialog(new TextPrompt(promptIds.TEXT));
        this.addDialog(new NumberPrompt(promptIds.NUMBER));
        this.addDialog(new DateTimePrompt(promptIds.DATETIME));
        this.addDialog(new ConfirmPrompt(promptIds.CONFIRM));
        this.addDialog(new AttachmentPrompt(promptIds.ATTACHMENT));
    }

    // Ask the user what they'd like to test and then load the appropriate dialogs for that
    private promptForOptionSelection = async (step: WaterfallStepContext) => {
        return await step.prompt(promptIds.CHOICE, utilities.getTestChoiceParams(choices, 'Prompt'));
    }

    private directToTest = async (step: WaterfallStepContext) => {
        switch (step.result.value) {
            case choices.text:
                return await step.beginDialog(dialogIds.TEXT);
            case choices.number:
                return await step.beginDialog(dialogIds.NUMBER);
            case choices.dateTime:
                return await step.beginDialog(dialogIds.DATETIME);
            case choices.confirm:
                return await step.beginDialog(dialogIds.CONFIRM);
            case choices.attachment:
                return await step.beginDialog(dialogIds.ATTACHMENT);
            case choices.back:
            default:
                return await step.replaceDialog(utilities.getTestingDialogId());
        }
    }

    private startText = async (step: WaterfallStepContext) => {
        utilities.beginTestPrint('Text Prompt');
        return await step.prompt(promptIds.TEXT, {
            prompt: 'Enter some text and I\'ll repeat it back.',
        });
    }

    private endText = async (step: WaterfallStepContext) => {
        const toEcho = step.result;
        const reply = `You said: **${toEcho}**`;
        await step.context.sendActivity(reply);
        console.log(reply);
        utilities.endTestPrint('Text Prompt');
        return await step.beginDialog(dialogIds.PROMPTS_MAIN);
    }

    private startNumber = async (step: WaterfallStepContext) => {
        utilities.beginTestPrint('Number Prompt');
        return await step.prompt(promptIds.NUMBER, {
            prompt: 'Enter a number and I\'ll repeat it back and confirm it was a number.',
            retryPrompt: 'That wasn\'t a number.',
        });
    }

    private endNumber = async (step: WaterfallStepContext) => {
        const reply = `You said: **${step.result}**, which is a **${typeof step.result}**`;
        await step.context.sendActivity(reply);
        console.log(reply);
        utilities.endTestPrint('Number Prompt');
        return await step.beginDialog(dialogIds.PROMPTS_MAIN);
    }

    private startDateTime = async (step: WaterfallStepContext) => {
        utilities.beginTestPrint('DateTime Prompt');
        return await step.prompt(promptIds.DATETIME, {
            prompt: 'Enter a Date-Time string.',
            retryPrompt: 'That wasn\'t a valid date-time string. Please use an appropriate format.',
        });
    }

    private endDateTime = async (step: WaterfallStepContext) => {
        const reply = `You said: ${step.result.value}, which is a valid date-time string`;
        await step.context.sendActivity(reply);
        console.log(reply);
        utilities.endTestPrint('DateTime Prompt');
        return await step.beginDialog(dialogIds.PROMPTS_MAIN);
    }

    private startConfirm = async (step: WaterfallStepContext) => {
        utilities.beginTestPrint('Confirm Prompt');
        return await step.prompt(promptIds.CONFIRM, {
            prompt: 'Please Confirm.',
            retryPrompt: 'That wasn\'t a valid confirmation. Must be boolean or click buttons.',
        });
    }

    private endConfirm = async (step: WaterfallStepContext) => {
        const reply = `You said: **${step.result}**, which is a valid Confirm boolean`;
        await step.context.sendActivity(reply);
        console.log(reply);
        utilities.endTestPrint('Confirm Prompt');
        return await step.beginDialog(dialogIds.PROMPTS_MAIN);
    }

    private startAttachment = async (step: WaterfallStepContext) => {
        utilities.beginTestPrint('Attachment Prompt');
        return await step.prompt(promptIds.ATTACHMENT, {
            prompt: 'Send me an attachment of any kind and I\'ll tell you all the details I know about it.',
        });
    }

    private endAttachment = async (step: WaterfallStepContext) => {
        const attachment = step.result[0];
        const reply =
            `You sent:\n
            **Name:** ${attachment.name}\n
            **Content** ${attachment.content}\n
            **Content Type:** ${attachment.contentType}\n
            **Content URL:** ${attachment.contentUrl}\n
            **Thumbnail URL:** ${attachment.thumbnailUrl}`;
        await step.context.sendActivity({
            text: 'Attachment:',
            attachments: [attachment],
        });
        console.log(reply);
        utilities.endTestPrint('Attachment Prompt');
    }
    private end = async (step: WaterfallStepContext) => {
        return await step.replaceDialog(dialogIds.PROMPTS_MAIN);
    }
}
