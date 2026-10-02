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
                } else {
            setTipoSensor('pedometer');
            return;
          }
        }
        setTipoSensor('accelerometer');
      } catch {
        setTipoSensor('accelerometer');
      }
    }

    detectarMelhorSensor();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [subscription]);

  function iniciarComAcelerometro() {
  try {
    setTipoSensor('accelerometer');
    setMensagem('');
    Accelerometer.setUpdateInterval(50); // 50ms para capturar o impacto exato

    const novaSubscricao = Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      const LIMIAR_PASSO = 1.18;
      const INTERVALO_MINIMO = 260;

      if (magnitude > LIMIAR_PASSO && !wasAboveThreshold.current) {
        if (now - lastStepTime.current > INTERVALO_MINIMO) {
          wasAboveThreshold.current = true;
          lastStepTime.current = now;
          setPassos((prev) => prev + 1);
        }
      } else if (magnitude < 1.10 || now - lastStepTime.current > 350) {
        wasAboveThreshold.current = false;
      }
    });

    setSubscription(novaSubscricao);
    setAtivo(true);
  } catch (error) {
    console.log(error);
    setMensagem('Não foi possível iniciar o acelerômetro.');
  }
}

async function alternarContador() {
  if (ativo) {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
    setAtivo(false);
    return;
  }

  setMensagem('');

  if (tipoSensor === 'pedometer') {
    try {
      if (Pedometer.requestPermissionsAsync) {
        const permissao = await Pedometer.requestPermissionsAsync();
          if (!permissao.granted) {
          iniciarComAcelerometro();
          return;
        }
      }

      const novaSubscricao = Pedometer.watchStepCount((result) => {
        setPassos(result.steps);
      });

      setSubscription(novaSubscricao);
      setAtivo(true);
      return;
    } catch {
      iniciarComAcelerometro();
      return;
    }
  }

  iniciarComAcelerometro();
}

function zerarPassos() {
  setPassos(0);
}

// Cálculo da porcentagem da meta de 10.000 passos
const porcentagemMeta = Math.min((passos / 10000) * 100, 100);