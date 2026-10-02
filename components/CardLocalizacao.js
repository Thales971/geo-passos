import { useState } from 'react';
import { StyleSheet, Text, View, Pressable, Linking } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons, Feather } from '@expo/vector-icons';

export default function CardLocalizacao() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [precisao, setPrecisao] = useState(null);
  const [endereco, setEndereco] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function obterLocalizacao() {
    try {
      setCarregando(true);
      setMensagem('');

      // Solicita permissão para acessar a localização
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setMensagem('Permissão de localização negada.');
        return;
      }

      // Obtém a posição geográfica atual do celular via GPS
      const localizacao = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = localizacao.coords.latitude;
      const lon = localizacao.coords.longitude;

        setLatitude(lat);
        setLongitude(lon);
        setPrecisao(
        localizacao.coords.accuracy
        ? Math.round(localizacao.coords.accuracy)
        : null
);

    // Geocodificação reversa
        try {
    const respostaEndereco = await Location.reverseGeocodeAsync({
    latitude: lat,
    longitude: lon,
  });

  if (respostaEndereco && respostaEndereco.length > 0) {
      const dados = respostaEndereco[0];
      setEndereco({
        rua: dados.street || dados.name || 'Localização Atual',
        numero: dados.streetNumber || '',
        bairro: dados.district || dados.subregion || '',
        cidade: dados.city || dados.subregion || '',
        estado: dados.region || '',
      });
    }
  } catch (errGeo) {
    console.log('Erro na geocodificação reversa:', errGeo);
  }
} catch (error) {
  console.log(error);
  setMensagem('Não foi possível obter sua localização. Verifique o GPS.');
} finally {
  setCarregando(false);
}

      function abrirNoMapa() {
          if (latitude && longitude) {
              const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
              Linking.openURL(url);
          }
      }

      return (
    <View style={styles.card}>
      {/* Cabeçalho do Card */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTituloWrapper}>
          <View style={styles.iconBadgeAzul}>
            <Ionicons name="location-outline" size={18} color="#2563EB" />
          </View>
          <Text style={styles.cardTitulo}>Minha Localização</Text>
        </View>

        <View style={styles.precisaoBadge}>
          <View style={styles.precisaoDot} />
          <Text style={styles.precisaoTexto}>
            Precisão ± {precisao ? ${precisao}m : '100m'}
          </Text>
        </View>
      </View>

{/* Caixa de Endereço Identificado */}
      <View style={styles.enderecoContainer}>
        <Text style={styles.enderecoLabel}>ENDEREÇO IDENTIFICADO</Text>
        {endereco ? (
          <>
            <Text style={styles.enderecoRua} numberOfLines={1}>
              {endereco.rua}
              {endereco.numero ? , ${endereco.numero} : ''}
            </Text>
            <Text style={styles.enderecoSubtexto} numberOfLines={1}>
              {[endereco.bairro, endereco.cidade, endereco.estado]
                .filter(Boolean)
                .join(' • ')}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.enderecoPlaceholder}>
              Localização ainda não capturada
            </Text>
            <Text style={styles.enderecoSubtexto}>
              Toque no botão abaixo para buscar via GPS
            </Text>
          </>
                  )}
    {/* Linha com Latitude e Longitude */}
      <View style={styles.coordenadasRow}>
        <View style={styles.coordBox}>
          <Text style={styles.coordLabel}>LATITUDE</Text>
          <Text style={styles.coordValor}>
            {latitude !== null ? latitude.toFixed(6) : '--'}
          </Text>
        </View>

        <View style={styles.coordBox}>
          <Text style={styles.coordLabel}>LONGITUDE</Text>
          <Text style={styles.coordValor}>
            {longitude !== null ? longitude.toFixed(6) : '--'}
          </Text>
        </View>
      </View>

      {mensagem ? <Text style={styles.mensagemAlerta}>{mensagem}</Text> : null}

      {/* Botão Primário: Obter localização */}
      <Pressable
        style={({ pressed }) => [
          styles.botaoEscuro,
          pressed && styles.botaoPressionado,
        ]}
        onPress={obterLocalizacao}
        disabled={carregando}
      >
        {carregando ? (
          <Ionicons
            name="hourglass-outline"
            size={17}
            color="#FFFFFF"
            style={styles.btnIcon}
          />
        ) : (
          <Ionicons
            name="time-outline"
            size={17}
            color="#FFFFFF"
            style={styles.btnIcon}
          />
        )}
        <Text style={styles.textoBotaoEscuro}>
          {carregando ? 'Buscando GPS...' : 'Obter localização'}
        </Text>
        </Pressable>

{/* Botão Secundário: Ver no Google Maps */}
      <Pressable
        style={({ pressed }) => [
          styles.botaoOutline,
          !latitude && styles.botaoDesabilitado,
          pressed && latitude && styles.botaoPressionado,
        ]}
        onPress={abrirNoMapa}
        disabled={!latitude}
      >
        <Feather
          name="map"
          size={16}
          color={latitude ? '#059669' : '#94A3B8'}
          style={styles.btnIcon}
        />
        <Text
          style={[
            styles.textoBotaoOutline,
            !latitude && styles.textoDesabilitado,
        ]}
        >
          Ver no Google Maps
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },