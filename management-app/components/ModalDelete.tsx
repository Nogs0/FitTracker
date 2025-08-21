import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export type ModalDeleteProps = {
    visible: boolean,
    setVisible: any,
    handleDelete: any,
}

export default function ModalDelete(props: ModalDeleteProps) {
    return (
        <Modal
            transparent
            animationType="fade"
            visible={props.visible}
            onRequestClose={() => props.setVisible(false)}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Confirmar Exclusão</Text>
                    <Text style={styles.message}>Tem certeza que deseja excluir este item?</Text>

                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => props.setVisible(false)} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={props.handleDelete} style={styles.confirmButton}>
                            <Text style={styles.confirmText}>Excluir</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container:
    {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    deleteButton:
    {
        backgroundColor: '#e53935',
        padding: 12,
        borderRadius: 8
    },
    deleteText:
    {
        color: '#fff',
        fontWeight: 'bold'
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 5,
        width: '80%',
        alignItems: 'center',
    },
    title:
    {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    message:
    {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 20
    },
    actions:
    {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
    cancelButton:
    {
        flex: 1,
        marginRight: 8,
        padding: 12,
        backgroundColor: '#ccc',
        borderRadius: 5,
        alignItems: 'center'
    },
    confirmButton:
    {
        flex: 1,
        marginLeft: 8,
        padding: 12,
        backgroundColor: '#e53935',
        borderRadius: 5,
        alignItems: 'center'
    },
    cancelText:
    {
        color: '#000',
        fontWeight: 'bold'
    },
    confirmText:
    {
        color: '#fff',
        fontWeight: 'bold'
    },
});
