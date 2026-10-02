import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Pedometer, Accelerometer } from 'expo-sensors';
import { Ionicons, Feather } from '@expo/vector-icons';

export default function CardPassos() {
  const [passos, setPassos] = useState(0);
  const [ativo, setAtivo] = useState(false);
  const [tipoSensor, setTipoSensor] = useState('verificando'); // 'pedometer' | 'accelerometer'
  const [subscription, setSubscription] = useState(null);
  const [mensagem, setMensagem] = useState('');

  // Referências para o algoritmo de contagem de passos via acelerômetro
  const lastStepTime = useRef(0);
  const wasAboveThreshold = useRef(false);

  useEffect(() => {
    // Detecta se o aparelho possui chip dedicado ou se usará o Acelerômetro (ex: Edge 30 Neo)
    async function detectarMelhorSensor() {
      try {
        const pedometerDisponivel = await Pedometer.isAvailableAsync();

        if (pedometerDisponivel) {
          if (Pedometer.getPermissionsAsync) {
            const perm = await Pedometer.getPermissionsAsync();
            if (perm.granted) {
              setTipoSensor('pedometer');
              return;
