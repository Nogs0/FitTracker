import AsyncStorage from '@react-native-async-storage/async-storage';

class AsyncStorageService {
    public async salvarArquivos(arquivos: any[]) {
        try {
            await AsyncStorage.setItem('@arquivos_gerados', JSON.stringify(arquivos));
            console.log('Arquivo salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar arquivos:', error);
        }
    }

    public async carregarArquivos() {
        try {
            const jsonValue = await AsyncStorage.getItem('@arquivos_gerados');
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (error) {
            console.error('Erro ao carregar arquivos:', error);
            return [];
        }
    }
}

export default new AsyncStorageService();