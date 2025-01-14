import React, { useState, useEffect } from "react";
import styled, {keyframes} from "styled-components";
import Spinner from "../UI/Spinner/Spinner";
import axios from "axios";

const FormWrapper = styled.div`
  width: 400px;
  padding: 1rem;
  margin: 4rem auto;
  -webkit-box-shadow: 0px 0px 5px 0px rgba(204, 204, 204, 1);
  -moz-box-shadow: 0px 0px 5px 0px rgba(204, 204, 204, 1);
  box-shadow: 0px 0px 5px 0px rgba(204, 204, 204, 1);
  @media (max-width: 500px) {
      width: 100%;
    }
  form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    input,
    button {
      padding: 0.5rem 1rem;
      margin: 0.5rem auto;
      outline: none;
      border-radius: 6px;
      width: 80%;
      border: 1px solid #ccc;
      font-size: 1.3rem;
      @media (max-width: 500px) {
      width: 100%;
    }
    }
    button {
      cursor: pointer;
      font-weight: 400;
      &:hover {
        background-color: #ccc;
        color: white;
      }
    }
  }
`;

const initialState = {
  form: {
    email: "",
    name: "",
    age: "",
    id: ""
  },
  isUpdating: false
};
const apiUrl = "http://localhost:5000/friends";
export default function FriendForm({ history, match }) {
  const [state, setState] = useState(initialState);
  useEffect(() => {
    if (match.params.friendId) {
      axios.get(`${apiUrl}/${match.params.friendId}`).then(res =>
        setState(prevState => ({
          ...prevState,
          form: {
            ...res.data
          },
          isUpdating: true,
        }))
      );
    }
  }, [match.params.friendId]);
  const addNewFriend = async newFriend => {
    setState(prevState => ({
      ...prevState,
      isLoading: true,
      errorMessage: ""
    }));
    try {
      const response = await axios.post(apiUrl, newFriend);
      setState(prevState => ({
        ...prevState,
        friends: response.data
      }));
    } catch (err) {
      setState(prevState => ({
        ...prevState,
        errorMessage: err.message
      }));
    } finally {
      setState(prevState => ({
        ...prevState,
        isLoading: false
      }));
      history.push("/");
    }
  };
  const updateFriend = async () => {
    try {
      const response = await axios.put(
        `${apiUrl}/${state.form.id}`,
        state.form
      );
    } catch (err) {
      setState(prevState => ({
        ...prevState,
        errorMessage: err.message
      }));
    } finally {
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        form: initialState.form,
        isUpdating: false
      }));
      history.push('/')
    }
  };
  const setCurrentFriend = id => {
    const currentFriend = state.friends.find(fr => fr.id === id);
    setState(prevState => ({
      ...prevState,
      isUpdating: true,
      form: {
        name: currentFriend.name,
        age: currentFriend.age,
        email: currentFriend.email
      },
      currentFriend: currentFriend.id
    }));
  };
  const inputChangeHandler = ({ target }) => {
    const targetValue = target.value;
    const targetName = target.name;
    setState(prevState => ({
      ...prevState,
      form: {
        ...prevState.form,
        [targetName]: targetValue
      }
    }));
  };
  const submitHandler = e => {
    e.preventDefault();
    if (state.isUpdating) {
      updateFriend();
    } else {
      const { email, age, name } = state.form;
      if (email && age && name) {
        addNewFriend({
          name,
          age,
          email
        });
        setState(prevState => ({
          ...prevState,
          form: { ...initialState.form }
        }));
      }
    }
  };
  return (
    <FormWrapper>
      {state.isLoading && <Spinner />}
      {state.errorMessage && (
        <p style={{ color: "red" }}>{state.errorMessage}</p>
      )}
      <form onSubmit={submitHandler}>
        <input
          type="text"
          name="name"
          onChange={inputChangeHandler}
          placeholder="Name"
          value={state.form.name}
        />
        <input
          type="number"
          name="age"
          onChange={inputChangeHandler}
          placeholder="Age"
          value={state.form.age}
        />
        <input
          type="email"
          name="email"
          onChange={inputChangeHandler}
          placeholder="Email"
          value={state.form.email}
        />
        <button>{state.isUpdating ? "Update" : "Add Friend" }</button>
      </form>
    </FormWrapper>
  );
}
