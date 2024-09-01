import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Button, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { dbTransaction } from '../../database/db';

const EditTaskScreen = () => {
  const [title, setTitle] = useState('Enter');
  const [detail, setDetail] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const navigation = useNavigation();
  const route = useRoute();
  const { taskTitle } = route.params || {}; // Get the task title from route params

  const fetchTaskData = useCallback(() => {
    if (!taskTitle) {
      console.error('Task title not provided');
      Alert.alert('Error', 'No task title provided for editing.');
      navigation.goBack();
      return;
    }

    dbTransaction(
      'SELECT * FROM todos WHERE title = ?',
      [taskTitle],
      (result) => {
        if (result.rows.length > 0) {
          const task = result.rows.item(0);
          setTitle(task.title);
          setDetail(task.description);
          setSelectedCategory(task.groupId);
        } else {
          Alert.alert('Error', 'No task found with the provided title.');
          navigation.goBack();
        }
      },
      (error) => {
        console.error('Failed to fetch task data:', error);
        Alert.alert('Error', 'Failed to fetch task data. Please try again.');
      }
    );
  }, [taskTitle, navigation]);

  const fetchCategories = useCallback(() => {
    dbTransaction(
      'SELECT * FROM groups',
      [],
      (result) => {
        const fetchedCategories = result.rows._array.map(row => ({
          label: row.name,
          value: row.id, 
        }));
        setCategories(fetchedCategories);
      },
      (error) => {
        console.error('Failed to fetch categories:', error);
        Alert.alert('Error', 'Failed to fetch categories. Please try again.');
      }
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTaskData();
      fetchCategories();
    }, [fetchTaskData, fetchCategories])
  );

  const handleEditTask = () => {
    if (!taskTitle) {
      Alert.alert('Error', 'No task title available to edit.');
      return;
    }
  
    const intSelectedCategory = parseInt(selectedCategory, 10);
  
    dbTransaction(
      'UPDATE todos SET title = ?, description = ?, groupId = ? WHERE title = ?',
      [title, detail, intSelectedCategory, taskTitle],
      () => {
        Alert.alert('Success', 'Task updated successfully.');
        navigation.goBack();
      },
      (error) => {
        console.error('Failed to edit task:', error);
        Alert.alert('Error', 'Failed to edit task. Please try again.');
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
      <Text style={styles.title}>Edit Task</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Detail"
        value={detail}
        onChangeText={setDetail}
      />

      {/* Category Dropdown */}
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

      {/* Button to add a new category */}
      <TouchableOpacity onPress={() => setCategoryModalVisible(true)} style={styles.addNewCategory}>
        <Ionicons name="add-circle-outline" size={20} color="#9b87ee" />
        <Text style={styles.addNewCategoryText}>Add New Category</Text>
      </TouchableOpacity>

      <View style={styles.btns}>
        <TouchableOpacity style={styles.button} onPress={handleEditTask}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Add Category Modal */}
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
    marginBottom: 10,
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
  btns: {
    flexDirection: 'row',
    gap: 20,
  },
});

export default EditTaskScreen;