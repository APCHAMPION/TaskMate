import React, { useState, useCallback,} from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import { dbTransaction } from '../../database/db';

const TodoItem = ({ title, subtitle, status, onStatusChange, onDelete, navigation }) => (
  <View style={styles.todoItem}>
    <View style={styles.todoText}>
      <Text style={styles.todoTitle}>{title}</Text>
      <Text style={styles.todoSubtitle}>{subtitle}</Text>
    </View>
    <View style={styles.todoActions}>
    <TouchableOpacity onPress={() => navigation.navigate('Edit', {taskTitle: title })}>
        <Ionicons name="pencil" size={20} color="#9b87ee" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete}>
        <Ionicons name="trash" size={20} color="#9b87ee" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onStatusChange}>
      <View style={[styles.iconContainer, status === 'completed' && styles.completedIcon]}>
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={status === 'completed' ? 'white' : '#9b87ee'}
          />
      </View>
      </TouchableOpacity>
    </View>
  </View>
);

export default function Index() {
  const navigation = useNavigation();
  const [todos, setTodos] = useState([]);
  const [filterCategory, setFilterCategory] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  // Fetch tasks from database
  const fetchTodos = useCallback(() => {
    dbTransaction(
      'SELECT * FROM todos',
      [],
      (result) => {
        const fetchedTodos = result.rows._array.map(row => ({
          id: row.id.toString(),
          title: row.title,
          subtitle: row.description,
          status : row.status,
          category: row.groupId,
        }));
        setTodos(fetchedTodos);
      },
      (error) => {
        console.error('Failed to fetch todos:', error);
        Alert.alert('Error', 'Failed to fetch todos. Please try again.');
      }
    );
  }, []);

  // Fetch categories from database
  const fetchCategories = useCallback(() => {
    dbTransaction(
      'SELECT * FROM groups',
      [],
      (result) => {
        const fetchedCategories = result.rows._array.map(row => ({
          label: row.name,
          value: row.id,
        }));
        setCategories([{ label: 'All', value: null }, ...fetchedCategories]);
      },
      (error) => {
        console.error('Failed to fetch categories:', error);
        Alert.alert('Error', 'Failed to fetch categories. Please try again.');
      }
    );
  }, []);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchTodos();
      fetchCategories();
    }, [fetchTodos, fetchCategories])
  );

  const updateStatus = (id, newStatus) => {
    dbTransaction(
      'UPDATE todos SET status = ? WHERE id = ?',
      [newStatus, id],
      () => {
        // Update the local state to reflect the change
        setTodos(todos.map(todo => 
          todo.id === id ? { ...todo, status: newStatus } : todo
        ));
      },
      (error) => {
        console.error('Failed to update status:', error);
        Alert.alert('Error', 'Failed to update status. Please try again.');
      }
    );
  };

  const deleteTodo = (id) => {
    dbTransaction(
      'DELETE FROM todos WHERE id = ?',
      [id],
      () => {
        // Update the local state to remove the deleted item
        setTodos(todos.filter(todo => todo.id !== id));
      },
      (error) => {
        console.error('Failed to delete todo:', error);
        Alert.alert('Error', 'Failed to delete todo. Please try again.');
      }
    );
  };

  const handleStatusChange = (id, currentStatus) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    updateStatus(id, newStatus);
  };

  const filteredData = todos.filter(item => {
    const matchesCategory = filterCategory ? item.category === filterCategory : true;
    const matchesStatus = filterStatus === 'all' ? true : item.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  const handleAllTasks = () => {
    setFilterStatus('all');
  };

  const handleCompletedTasks = () => {
    setFilterStatus('completed');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TaskMate</Text>
      </View>

      <DropDownPicker
        items={categories}
        open={isDropdownOpen}
        value={filterCategory}
        setOpen={setDropdownOpen}
        setValue={setFilterCategory}
        placeholder="Filter by category"
        style={styles.dropdown}
        dropDownContainerStyle={{ borderColor: '#ccc' }}
      />

      <FlatList
        data={filteredData}
        renderItem={({ item }) => (
          <TodoItem 
            title={item.title} 
            subtitle={item.subtitle} 
            status={item.status} 
            onStatusChange={() => handleStatusChange(item.id, item.status)}
            onDelete={()=> deleteTodo(item.id)}
            navigation={navigation} 
          />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton } onPress={handleAllTasks}>
          <Ionicons name="list" size={24} color={filterStatus==='all' ? "#493d8e":"#9b87ee"} />
          <Text style={filterStatus==='all' ? styles.activefooterTest:styles.footerText} >All Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('Add')}>
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={handleCompletedTasks}>
          <Ionicons name="checkmark" size={24} color={filterStatus==='completed' ? "#493d8e":"#9b87ee"} />
          <Text style={filterStatus==='completed' ? styles.activefooterTest:styles.footerText}>Completed</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#7a67ee',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  dropdown: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderColor: '#ccc',
    width: 350,
    alignSelf: 'center',
    marginTop: 10,
  },
  todoItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  todoText: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 16,
    color: '#7a67ee',
    fontWeight: 'bold',
  },
  todoSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  todoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    marginLeft: 5,
    color: '#9b87ee',
    fontSize: 16,
  },
  activefooterTest:{
    marginLeft: 5,
    color: '#493d8e',
    fontSize: 16,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7a67ee',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: '55%',
    marginLeft: -28,
  },

  iconContainer:{
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedIcon: {
    backgroundColor: 'darkgreen',
    borderRadius: 100,
  },
});
