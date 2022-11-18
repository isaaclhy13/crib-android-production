import React, {useState, useEffect} from 'react';

import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    Dimensions,
    Pressable,
    Animated,
    KeyboardAvoidingView,
    TextInput
} from 'react-native';


import Ionicons from 'react-native-vector-icons/Ionicons';
Ionicons.loadFont()

import { HEIGHT, WIDTH, ContinueButton, ContinueText,
EditPagesHeaderContainer, EditPageBackButtonContainer, EditPageForwardButtonContainer, EditPageNameContainer} from '../../sharedUtils';

import Lottie from 'lottie-react-native';


import {Header, ProgressBarContainer, SubtitleText, TitleText,
    GeneralTextInput, TextInputContainer} from './loginStyle';

export default function LoginScreen({navigation, route}){
    const [phoneNumber, setPhoneNumber] = useState("")
    const [passedPhoneNumber, setPassedPhoneNumber]= useState("")
    const [loading, setLoading] = useState(false)
    
    async function signupStep1(){
        setLoading(true)
        const number = phoneNumber.replace(/[^\d]/g, '').substring(0,10);
        console.log(number)
        await fetch('https://crib-llc.herokuapp.com/users/authy', {
            method: 'POST',
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber: number,
            })
        }) 
        .then(async res => {
            // console.log(res)
            // console.log(res.status)
            const data = await res.json();

            if(res.status == 200 && data.authy_id != undefined){
                signupStep2(data.authy_id, number)
                setLoading(false)
            }
            else if(res.status == 401){
                alert("User doesn't exist, please sign up!")
                setLoading(false)
                setPhoneNumber("")
                navigation.navigate("ProfileTabs")
            }
            else{
                alert("Error in login, please try again later!")
                navigation.navigate("ProfileTabs")
            }
            
        }).catch(e=>{
            alert("Error in login, please try again later!")
        })
    }

    async function signupStep2(authy_id, number){
     
        await fetch('https://crib-llc.herokuapp.com/users/OTP/step2', {
            method: 'POST',
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                authy_id: authy_id,
            })
        }) 
        .then(res => {
                if(res.status == 201 || res.status == 200){
                    setLoading(false)
                    navigation.reset({index: 0 , routes: [{ name: 'Login_OTP', authy_id: authy_id, phoneNumber: number }]})
                }
                else{
                    alert("Error in login, please try again later!")
                    setLoading(false)
                    navigation.reset({index: 0 , routes: [{ name: 'ProfileTabs'}]})
                }
        }).catch(e=>{
            alert("Error in login, please try again later!")
        })

        setLoading(false)
    }

    

    function checkInput(){
        console.log(passedPhoneNumber)
        if(passedPhoneNumber.length != 10){
            alert("Phone number is invalid")
        }
       else{
            signupStep1()
       }

       

    }

    const handleInput = (e) => {
        // this is where we'll call our future formatPhoneNumber function that we haven't written yet.
        const formattedPhoneNumber = formatPhoneNumber(e);
        // we'll set the input value using our setInputValue
        setPhoneNumber(formattedPhoneNumber)
    };


    function formatPhoneNumber(value){
        if (!value) return value;
        setPassedPhoneNumber(value)
        // clean the input for any non-digit values.
        let number = value.replace(/[^\d]/g, '');
        setPassedPhoneNumber(number.substring(0,10))
        // phoneNumberLength is used to know when to apply our formatting for the phone number
        const phoneNumberLength = number.length;
      


        if (phoneNumberLength < 4) return number;

        if (phoneNumberLength < 7) {
            return `(${number.slice(0, 3)})-${number.slice(3)}`;
        }
        return `(${number.slice(0, 3)})-${number.slice(
            3,
            6
        )}-${number.slice(6, 10)}`;
    }

    return(
        <SafeAreaView style={{flex: 1,  height:HEIGHT, width:WIDTH}} >
            <KeyboardAvoidingView 
           
            behavior='padding' style={{flex:1, backgroundColor:'white'}}>
            <EditPagesHeaderContainer style={{borderBottomWidth: 0}}>
                <EditPageBackButtonContainer>
                    <Pressable disabled={loading} onPress={()=>navigation.goBack()}>
                        <Ionicons name='arrow-back-outline' size={25} color='black'/>
                    </Pressable>
                </EditPageBackButtonContainer>
                <EditPageNameContainer>
                    
                </EditPageNameContainer> 
                <EditPageForwardButtonContainer/>
            </EditPagesHeaderContainer>
                
            <ProgressBarContainer>

            </ProgressBarContainer>
           
            <ScrollView scrollEnabled={false} style={{backgroundColor:'white', minHeight: HEIGHT*0.45608}}>
                <TitleText>Login with your phone number</TitleText>
                <SubtitleText>We will send you a one time password to verify your number</SubtitleText>
                <TextInputContainer>
                    <GeneralTextInput editable={!loading} value={phoneNumber} onChangeText={(value)=> handleInput(value)}
                    keyboardType = "number-pad" placeholder="xxx-xxx-xxxx"/>
                        
                    
                </TextInputContainer>
            </ScrollView>
          

            <ContinueButton disabled={loading} loading={loading} onPress={checkInput}>
            {loading ?
                <Lottie source={require('../../loadingAnim.json')} autoPlay loop style={{width:WIDTH*0.3, height: WIDTH*0.3, }}/>
            :
                <ContinueText>Continue</ContinueText>
            }
            </ContinueButton>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}