import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Pressable, Modal, Button, Alert } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [countdown, setCountdown] = useState('');
  const countdownInterval = useRef(null);
  const [infoVisible, setInfoVisible] = useState(false); 
  const COOLDOWN_DURATION = 24 * 60 * 60 * 1000; 

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'votes'), (snapshot) => {
      setVoteCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkCooldown = async () => {
      const lastVoteTime = await AsyncStorage.getItem('lastVoteTime');
      if (lastVoteTime) {
        const lastTime = parseInt(lastVoteTime);
        const timeElapsed = Date.now() - lastTime;
        const remaining = COOLDOWN_DURATION - timeElapsed;

        if (remaining > 0) {
          setVoted(true);
          startCountdown(lastTime);
        } else {
          await AsyncStorage.removeItem('lastVoteTime');
          setVoted(false);
          setCountdown('');
        }
      }
    };

    checkCooldown();
    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, []);

  const startCountdown = (lastTime) => {
    countdownInterval.current = setInterval(() => {
      const now = Date.now();
      const remaining = COOLDOWN_DURATION - (now - lastTime);

      if (remaining <= 0) {
        clearInterval(countdownInterval.current);
        setVoted(false);
        setCountdown('');
        AsyncStorage.removeItem('lastVoteTime');
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setCountdown(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
  };

  const handleVote = async () => {
    try {
      await addDoc(collection(db, 'votes'), {
        timestamp: serverTimestamp(),
      });

      const now = Date.now();
      await AsyncStorage.setItem('lastVoteTime', now.toString());

      setVoted(true);
      startCountdown(now);
      Alert.alert('Thank you for voting!', '', [{ text: 'OK' }]);
    } catch (e) {
      Alert.alert('Error occurred', '', [{ text: 'OK' }]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRight}>
        <Button title="Info" onPress={() => setInfoVisible(true)} />
      </View>

      <Modal
        visible={infoVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setInfoVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Info</Text>
            <Text>
              Vote if you want Hot Chocolate Machines! You can vote once every 24 hours. Votes are counted live. - Dhanvin, Student Councillor Vice Chair. App coded by Sharlene Tan Qin Ying, Yip Jia Yi, Tan Xin Tong Joy and Ye Ting Esther.
            </Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => setInfoVisible(false)}
            >
              <Text style={{ color: '#fff' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Image
        source={require('./assets/logo.png')}
        style={{ width: 200, height: 150 }}
      />
      <Text>Do you want Hot Chocolate Machines in school?</Text>
      <Text style={{ fontSize: 24, margin: 10 }}>Votes: {voteCount}</Text>

      <Button
        title={voted ? `Voted — wait ${countdown}` : "Vote YES"}
        onPress={handleVote}
        disabled={voted}
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRight: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: 300,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});