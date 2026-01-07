declare enum ClientTokenType {
}
type EventListenerClientToken = {};
type ClientTokenValue = EventListenerClientToken;
type ClientToken = {
    type: ClientTokenType;
    value: ClientTokenValue;
};
export { ClientToken, };
