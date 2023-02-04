import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { BackButton } from "../components/BackButton";
import { Checkbox } from "../components/Checkbox";
import { Feather } from '@expo/vector-icons';
import colors from "tailwindcss/colors";
import { api } from "../lib/axios";
import { Loading } from "../components/Loading";

const avaiilabeWeekDays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export function New() {
  const [weekDays, setWeekDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');

  function handleToggleWeekDay(weekDayIndex: number) {
    if (weekDays.includes(weekDayIndex)) {
      setWeekDays(prevState => prevState.filter(weekDay => weekDay !== weekDayIndex));
    } else {
      setWeekDays(prevState => [...prevState, weekDayIndex]);
    }
  }

  async function handleCreateNewHbit() {
    try {
      setLoading(true);
      if (!title.trim() || weekDays.length === 0) {
        return Alert.alert('Atenção', 'Informe o nome do hábito e escolha a periodicidade');
      }
      await api.post('/habits', {
        title, 
        weekDays
      });

      setTitle('');
      setWeekDays([]);
      Alert.alert('Sucesso', 'Hábito criado com sucesso');

    } catch (error) {
      console.log(error);
      Alert.alert('Ops', 'Erro ao criar novo hábito');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (<Loading />);
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <BackButton />

        <Text className="mt-6 text-white font-extrabold text-3xl">Criar Hábito </Text>
        <Text className="mt-6 text-white font-semibold text-base">Qual seu comprometimento? </Text>

        <TextInput
          placeholder="Exercícios, dormir bem, etc..."
          placeholderTextColor={colors.zinc[400]}
          onChangeText={setTitle}
          value={title}
          className="h-12 pl-4 rounded-lg mt-3 bg-zinc-900 text-white border-2 border-zinc-800 focus:border-green-600"
        />

        <Text className="font-semibold mt-4 mb-3 text-white text-base"> Qual a recorrência? </Text>
        {
          avaiilabeWeekDays.map((weekDay, index) => (
            <Checkbox key={weekDay} title={weekDay} checked={weekDays.includes(index)} onPress={() => handleToggleWeekDay(index)} />
          ))
        }

        <TouchableOpacity 
          className="w-full h-14 flex-row items-center justify-center bg-green-600 rounded-md mt-6" 
          activeOpacity={0.7}
          onPress={handleCreateNewHbit}
        >
          <Feather name="check" size={20} color={colors.white} />

          <Text className="font-semibold text-base text-white ml-2"> Confirmar </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}