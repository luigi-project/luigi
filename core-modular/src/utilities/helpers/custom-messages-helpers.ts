class CustomMessagesHelpersClass{
    filterIdFromMessageObject(message: Record<string, any>): { id: string | undefined; messageWithoutId: Record<string, any> } {
        const { id, ...messageWithoutId } = message;
        return { id, messageWithoutId };
    }
}

export const CustomMessagesHelpers = new CustomMessagesHelpersClass();