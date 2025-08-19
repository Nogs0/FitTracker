import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, Text } from 'react-native';
import stylesGlobal from '../../styles/global';

export default function CollectionScreen() {
  const router = useRouter();
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled">
          <SafeAreaView style={stylesGlobal.mainContainer}>
            <View style={stylesGlobal.pageTitleContainer}>
              <TouchableOpacity style={stylesGlobal.buttonVoltar}
                onPress={() => router.back()}>
                <Feather name='arrow-left' size={15} />
                <Text>Voltar</Text>
              </TouchableOpacity>
              <View>
                <Text style={stylesGlobal.pageTitle}>Historico de coletas</Text>
                <Text style={stylesGlobal.subtitleText}>Visualize sessões anteriores</Text>
              </View>
            </View>
            <TouchableOpacity style={stylesGlobal.card}
              onPress={() => router.push('/collections/collectionDetails')}>
              <View style={stylesCollections.containerNamecard}>
                <Text style={stylesCollections.nameCard}>Joãozinho gameplays</Text>
                <Feather name='arrow-right' size={20}></Feather>
              </View>
              <View style={stylesCollections.containerDateTime}>
                <View style={stylesCollections.containerTextDateTime}>
                  <Ionicons name='calendar-clear-outline' size={14}></Ionicons>
                  <Text>19/08/2025</Text>
                </View>
                <View style={stylesCollections.containerTextDateTime}>
                  <Ionicons name='stopwatch-outline' size={14}></Ionicons>
                  <Text>01:00</Text>
                </View>
              </View>
              <View style={stylesCollections.containerCardsRelatorio}>
                <View style={[stylesCollections.cardRelatorio, stylesCollections.cardRelatorioRegistros]}>
                  <Text>50</Text>
                  <Text style={stylesCollections.labelCardRelatorio}>Registros</Text>
                </View>
                <View style={[stylesCollections.cardRelatorio, stylesCollections.cardRelatorioTempo]}>
                  <Text>50s</Text>
                  <Text style={stylesCollections.labelCardRelatorio}>Segundos</Text>
                </View>
                <View style={[stylesCollections.cardRelatorio, stylesCollections.cardRelatorioExemplo]}>
                  <Text>50</Text>
                  <Text style={stylesCollections.labelCardRelatorio}>Pulsos</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={stylesGlobal.card}>
              <View style={stylesCollections.containerNamecard}>
                <Text style={stylesCollections.nameCard}>Joãozinho gameplays</Text>
                <Feather name='arrow-right' size={20}></Feather>
              </View>
              <View style={stylesCollections.containerDateTime}>
                <View style={stylesCollections.containerTextDateTime}>
                  <Ionicons name='calendar-clear-outline' size={14}></Ionicons>
                  <Text>19/08/2025</Text>
                </View>
                <View style={stylesCollections.containerTextDateTime}>
                  <Ionicons name='stopwatch-outline' size={14}></Ionicons>
                  <Text>01:00</Text>
                </View>
              </View>
              <View style={stylesCollections.containerCardsRelatorio}>
                <View style={[stylesCollections.cardRelatorio, stylesCollections.cardRelatorioRegistros]}>
                  <Text>50</Text>
                  <Text style={stylesCollections.labelCardRelatorio}>Registros</Text>
                </View>
                <View style={[stylesCollections.cardRelatorio, stylesCollections.cardRelatorioTempo]}>
                  <Text>50s</Text>
                  <Text style={stylesCollections.labelCardRelatorio}>Segundos</Text>
                </View>
                <View style={[stylesCollections.cardRelatorio, stylesCollections.cardRelatorioExemplo]}>
                  <Text>50</Text>
                  <Text style={stylesCollections.labelCardRelatorio}>Pulsos</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={stylesGlobal.card}>
              <View style={stylesCollections.containerNamecard}>
                <Text style={stylesCollections.nameCard}>Joãozinho gameplays</Text>
                <Feather name='arrow-right' size={20}></Feather>
              </View>
              <View style={stylesCollections.containerDateTime}>
                <View style={stylesCollections.containerTextDateTime}>
                  <Ionicons name='calendar-clear-outline' size={14}></Ionicons>
                  <Text>19/08/2025</Text>
                </View>
                <View style={stylesCollections.containerTextDateTime}>
                  <Ionicons name='stopwatch-outline' size={14}></Ionicons>
                  <Text>01:00</Text>
                </View>
              </View>
              <View style={stylesCollections.containerCardsRelatorio}>
                <View style={[stylesCollections.cardRelatorio, stylesCollections.cardRelatorioRegistros]}>
                  <Text>50</Text>
                  <Text style={stylesCollections.labelCardRelatorio}>Registros</Text>
                </View>
                <View style={[stylesCollections.cardRelatorio, stylesCollections.cardRelatorioTempo]}>
                  <Text>50s</Text>
                  <Text style={stylesCollections.labelCardRelatorio}>Segundos</Text>
                </View>
                <View style={[stylesCollections.cardRelatorio, stylesCollections.cardRelatorioExemplo]}>
                  <Text>50</Text>
                  <Text style={stylesCollections.labelCardRelatorio}>Pulsos</Text>
                </View>
              </View>
            </TouchableOpacity>
          </SafeAreaView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const stylesCollections = StyleSheet.create({
  containerNamecard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  nameCard: {
    fontWeight: 'bold',
    fontSize: 16
  },
  containerDateTime: {
    flexDirection: 'row',
    gap: 7,
    marginVertical: 10
  },
  containerTextDateTime: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'center'
  },
  containerCardsRelatorio: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  cardRelatorio: {
    borderRadius: 5,
    width: '30%',
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  labelCardRelatorio: {
    opacity: 0.5,
    fontSize: 12
  },
  cardRelatorioTempo: {
    backgroundColor: 'rgb(200, 255, 214)'
  },
  cardRelatorioRegistros: {
    backgroundColor: 'rgb(231, 247, 255)'
  },
  cardRelatorioExemplo: {
    backgroundColor: 'rgb(255, 231, 231)'
  }
})
