import Cores from '@/styles/cores';
import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList } from 'react-native';

export type ModalSelectDeviceBluetoothProps = {
    visible: boolean,
    setVisible: any,
    handleConnect: any,
    devices: any[],
    tentandoConectar: boolean
}

export default function ModalSelectDeviceBluetooh(props: ModalSelectDeviceBluetoothProps) {
    return (
        <Modal
            transparent
            animationType="fade"
            visible={props.visible}
            onRequestClose={() => props.setVisible(false)}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Selecionar dispositivo</Text>
                    <FlatList
                        style={{ width: '100%', marginBottom: 20, padding: 5 }}
                        data={props.devices}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => {
                            return (
                                <TouchableOpacity
                                    disabled={props.tentandoConectar}
                                    onPress={() => props.handleConnect(item)}
                                    style={{
                                        padding: 5,
                                        borderRadius: 5,
                                        elevation: 3,
                                        justifyContent: 'center',
                                        width: '100%',
                                        height: 40,
                                        backgroundColor: Cores.azulClaro,
                                        marginHorizontal: 'auto'
                                    }}>
                                    <Text>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                        ItemSeparatorComponent={() => <View style={{ marginBottom: 5 }}></View>}
                    />

                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>Cancelar</Text>
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
        padding: 12,
        backgroundColor: '#e53935',
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
        color: '#fff',
        fontWeight: 'bold'
    },
});
