import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    mainContainer: {
        marginTop: 20,
        flex: 1,
        gap: 10,
        padding: 15
    },
    pageTitle: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    inputsContainer: {
        marginVertical: 10
    },
    inputContainer: {
        marginVertical: 5
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    titleText: {
        fontWeight: 'bold',
        fontSize: 18,
        marginStart: 10
    },
    subtitleText: {
        fontSize: 12,
        opacity: 0.4
    },
    card: {
        padding: 15,
        borderRadius: 5,
        backgroundColor: 'white',
        elevation: 3
    },
    containerList: {
        marginVertical: 10
    },
    labelList: {
        opacity: 0.5
    },
    cardList: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: 'rgb(240, 240, 240)',
        marginTop: 10
    },
    labelInput: {
        fontWeight: 'bold',
        marginBottom: 5
    },
    inputCustomized: {
        borderColor: 'rgba(139,139,139,1)',
        borderWidth: 0.5,
        borderRadius: 5
    },
    buttonLabel: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    button: {
        flexDirection: 'row',
        padding: 10,
        color: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        elevation: 4
    },
    pageTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 15,
        marginBottom: 10
    },
    buttonStartCollection: {
        backgroundColor: 'rgba(52,184,55,1)'
    },
    pickerStyle: {
        width: '100%'
    },
    buttonVoltar: {
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center',
        width: 'auto',
        padding: 5,
        borderRadius: 5,
        justifyContent: 'space-around',
        elevation: 5,
    }
});