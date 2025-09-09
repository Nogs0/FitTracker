import AsyncStorage from '@react-native-async-storage/async-storage';

class AsyncStorageService {
    public async salvarArquivos(arquivos: any[]) {
        try {
            await AsyncStorage.setItem('@coletas_geradas', JSON.stringify(arquivos));
            console.log('Arquivo salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar coletas:', error);
        }
    }

    public async carregarColetas() {
        try {
            const jsonValue = await AsyncStorage.getItem('@coletas_geradas');
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (error) {
            console.error('Erro ao carregar coletas:', error);
            return [];
        }
    }
}

export default new AsyncStorageService();