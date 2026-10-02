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
