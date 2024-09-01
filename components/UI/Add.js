import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Button, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import { dbTransaction } from '../../database/db';
import { useNavigation } from '@react-navigation/native';

const AddTaskScreen = () => {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    dbTransaction(
      'SELECT * FROM groups',
      [],
      (result) => {
        const updatedCategories = result.rows._array.map(row => ({
          label: row.name,
          value: row.id,
        }));
        setCategories(updatedCategories);
      },
      (error) => {
        console.error('Failed to fetch categories:', error);
      }
    );
  };

  const handleAddTask = () => {
    if (!title.trim() || !selectedCategory) {
      Alert.alert('Validation Error', 'Please enter a title and select a category.');
      return;
    }
  
    dbTransaction(
      'INSERT INTO todos (title, description, status, groupId) VALUES (?, ?, ?, ?)',
      [title.trim(), detail.trim(), 'pending', selectedCategory],
      () => {
        Alert.alert('Success', 'Task added successfully!');
        setTitle('');
        setDetail('');
        setSelectedCategory(null);
        navigation.navigate('Index', { refresh: true });
      },
      (error) => {
        console.error('Failed to add task:', error);
        Alert.alert('Error', 'Failed to add task. Please try again.');
      }
    );
  };

  const handleAddCategory = () => {  
    if (!newCategory.trim()) {
      Alert.alert('Validation Error', 'Please enter a category name.');
      return;
    }
  
    dbTransaction(
      'INSERT INTO groups (name) VALUES (?)',
      [newCategory.trim()],
      () => {
        fetchCategories();
        setNewCategory('');
        setCategoryModalVisible(false);
        Alert.alert('Success', 'Category added successfully!');
      },
      (error) => {
        console.error('Failed to add category:', error);
        Alert.alert('Error', 'Failed to add category. Please try again.');
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Task</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Detail"
        value={detail}
        onChangeText={setDetail}
      />
      
      <DropDownPicker
        items={categories}
        open={isDropdownOpen}
        value={selectedCategory}
        setOpen={setDropdownOpen}
        setValue={setSelectedCategory}
        setItems={setCategories}
        placeholder="Select a category"
        style={styles.dropdown}
        dropDownContainerStyle={{ borderColor: '#ccc' }}
        onChangeValue={(value) => setSelectedCategory(value)}
      />

      <TouchableOpacity onPress={() => setCategoryModalVisible(true)} style={styles.addNewCategory}>
        <Ionicons name="add-circle-outline" size={20} color="#9b87ee" />
        <Text style={styles.addNewCategoryText}>Add New Category</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleAddTask}>
        <Text style={styles.buttonText}>ADD</Text>
      </TouchableOpacity>

      {/* -------------------------dropdown model-------------------------- */}
      <Modal visible={isCategoryModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Category</Text>
            <TextInput
              style={styles.input}
              placeholder="Category Name"
              value={newCategory}
              onChangeText={setNewCategory}
            />
            <Button title="Add" onPress={handleAddCategory} />
            <Button title="Cancel" onPress={() => setCategoryModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ----------------styling--------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: '#7a67ee',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#7a67ee',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  dropdown: {
    marginBottom: 10,
    borderColor: '#ccc',
  },
  addNewCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom:10,
  },
  addNewCategoryText: {
    color: '#9b87ee',
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
});

export default AddTaskScreen;
