import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Button, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'votes'), (snapshot) => {
      setVoteCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);

  const handleVote = async () => {
    try {
      await addDoc(collection(db, 'votes'), {
        timestamp: serverTimestamp(),
      });
      setVoted(true);
      Alert.alert('Thank you for voting!', '', [{ text: 'OK', onPress: () => {} }]);
    } catch (e) {
      Alert.alert('Error occurred', '', [{ text: 'OK', onPress: () => {} }]);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/logo.png')}
        style={{ width: 200, height: 150 }}
      />
      <Text>Do you want Hot Chocolate Machines in school?</Text>
      <Text style={{ fontSize: 24, margin: 10 }}>Votes: {voteCount}</Text>
      <Button
        title={voted ? "Voted" : "Vote"}
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
});