import React, { useState, useEffect, useContext } from 'react';

import {
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput
} from 'react-native';
import OneSignal from 'react-native-onesignal';
import { Container, Heading, HeadingImageContainer, SubtitleText, 
    ModalView, ModalHeaderText, UserNumberText, ModalOptionContainer, ModalOption,
    InputFollowUpContainer} from './login_otpStyle';

import { ContinueButton , ContinueText,  EXTRALIGHT} from '../../sharedUtils';

import OTPInputField from  './login_otpStyle'
import { UserContext } from '../../UserContext';

import EncryptedStorage from 'react-native-encrypted-storage';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { HEIGHT, WIDTH, PRIMARYCOLOR } from '../../sharedUtils';

import Modal from "react-native-modal";

export default function Login_OTP({navigation, route}){

    const {login, sb} = useContext(UserContext);
    const [code, setCode] = useState('')
    const [pinReady, setpinReady] = useState(false)
    const [authyID, setauthyID] = useState(route.authy_id)
    const [smsErrorModal, setSMSErrorModal] = useState(false)
    const [laoding, setLoading] = useState(false)

    const MAX_CODE_LENGTH = 6;

    useEffect(()=> {
        setauthyID(route.authy_id)
    },[])

    async function userLogin(){ 

        if(code.length != 6){
            alert("Incorrect code!")
            return;
        }
        
        let oneSignalUserId = await EncryptedStorage.getItem('oneSignalUserID');
       
    
        let success = false
        fetch('https://crib-llc.herokuapp.com/users/login', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                authy_id: route.authy_id,
                token: code,
                phoneNumber: route.phoneNumber,
                oneSignalUserId: oneSignalUserId
            })
        })
        .then( res => {
            if(res.status == 200){          
                success =true
            } else{
                alert("Incorrect code.")
                setCode("")
                success=false
            }
            
            return res.json()
        }).then( async data =>{
            if(success){
                try{
                    OneSignal.disablePush(false);
                    if(data.token.accessToken != undefined){
                        await EncryptedStorage.setItem("accessToken", data.token.accessToken)
                    }
                    if(data.loggedIn.profilePic != undefined){
                        await EncryptedStorage.setItem("profilePic", data.loggedIn.profilePic)
                    }
                    if(data.loggedIn._id != undefined){
                        await EncryptedStorage.setItem("userId", data.loggedIn._id)
                    }
                    if(data.loggedIn.firstName != undefined){
                        await EncryptedStorage.setItem("firstName", data.loggedIn.firstName)
                    }
                    if(data.loggedIn.lastName != undefined){
                        await EncryptedStorage.setItem("lastName", data.loggedIn.lastName)
                    }
                    if(data.token.refreshToken != undefined){
                        await EncryptedStorage.setItem("refreshToken", data.token.refreshToken)
                    }
                    
                    if(data.loggedIn._id != undefined){
                        await AsyncStorage.setItem("userId", data.loggedIn._id)
                    }
                    if(data.loggedIn.firstName != undefined){
                        await AsyncStorage.setItem("firstName", data.loggedIn.firstName)
                    }
                    if(data.loggedIn.lastName != undefined){
                        await AsyncStorage.setItem("lastName", data.loggedIn.lastName)
                    }
                    if(data.loggedIn.profilePic != undefined){
                        await AsyncStorage.setItem("profilePic", data.loggedIn.profilePic)
                    }
                    connectSendbird()
                }
                catch{e=>{
                    console.log(e)
                }}

                login(data.loggedIn._id)
                navigation.reset(
                    {index: 0 , routes: [{ name: 'DiscoverTabs'}]}
                )
                
            }

        })
    }

    const connectSendbird = async () => {
        try{
            const UID = await EncryptedStorage.getItem("userId");
            if (UID != undefined) {
              try {
                console.log("connecting to sendbird")
             
                sb.connect(UID, function (user, error) {
                  if (error) {
                    // Handle error.
                    console.log("sendbird error")
                    console.log(error)
                  }
                  else {
                    console.log("sendbird connected")
                  }
                  // The user is connected to Sendbird server.
                });
                // The user is connected to the Sendbird server.
              } catch (err) {
                console.log(err)
                console.log("SENDBIRD ERROR")
              }
            }
        }
        catch{
            alert("Error. Please try again later!")
        }
        
      }
    function backToLogin(){
        navigation.reset(
            {index: 0 , routes: [{ name: 'Login', wrongPhoneNumber: true}]}
        )
    }

    function resendSMS(){
       
        fetch('https://crib-llc.herokuapp.com/users/OTP/step2', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                authy_id: route.authy_id
            })
        })
        .then(res => res.json()).then(data =>{
            if(data.response.success != true){
                alert("invalid in step 2.")
            }
        })
        setLoading(false)
        setSMSErrorModal(false)
    }
    return(
        <SafeAreaView style={{ flex: 1}}>
            
            <Container>
            <KeyboardAvoidingView behavior='padding' style={{flex:1, backgroundColor:'white'}}>
                <ScrollView style={{minHeight: HEIGHT*0.5}}>
                    <Pressable onPress={()=> navigation.reset({index: 0 , routes: [{ name: 'ProfileTabs'}]})} style={{flexDirection:'row', width: WIDTH*0.8, alignSelf:'center', justifyContent:'flex-end'}}>
                      <Text style={{color: 'black', fontSize: HEIGHT*0.02, padding: WIDTH*0.02}}>Exit</Text>
                    </Pressable>
                    <HeadingImageContainer>
                        <Heading>Enter OTP</Heading>
                        <SubtitleText>Please enter the one time password sent to you through sms</SubtitleText>
                    </HeadingImageContainer>
                    <InputFollowUpContainer>
                    
             
                    <TextInput 
                    keyboardType = "number-pad"
                    maxLength={6}
                    onChangeText={(value) => setCode(value)}
                    style={{width: WIDTH*0.8, paddingVertical: HEIGHT*0.01, backgroundColor: EXTRALIGHT, alignSelf: 'center', paddingLeft: WIDTH*0.025413}}>

                    </TextInput>
                    <Pressable onPress={()=>setSMSErrorModal(true)}>
                        <SubtitleText>Didn't recieve SMS?</SubtitleText>
                    </Pressable>
                    </InputFollowUpContainer>
                </ScrollView>
                <ContinueButton style={{marginBottom: HEIGHT*0.05}} onPress={()=> userLogin()}>
                    <ContinueText>Continue</ContinueText>
                </ContinueButton>
                </KeyboardAvoidingView>
            </Container>
            <Modal isVisible={smsErrorModal} animationIn= 'zoomIn' animationOut='zoomOut'
            style={{padding:0, margin: 0, justifyContent:'center', alignItems:'center', flex:1}}>
            <TouchableWithoutFeedback onPress={()=>setSMSErrorModal(false)}>
            <View style={{width:WIDTH, height: HEIGHT,justifyContent:'center', alignItems:'center'}}>
                <ModalView>
                    <ModalHeaderText>
                        Is this number correct?
                    </ModalHeaderText>
                    <UserNumberText>
                        +1 ({route.phoneNumber.slice(0, 3)})-{route.phoneNumber.slice(3,6)}-{route.phoneNumber.slice(6, 10)}
                    </UserNumberText>
                    <ModalOptionContainer>
                        <ModalOption onPress={()=> {setSMSErrorModal(false),  backToLogin()}}>
                            <Text style={{}}>No</Text>
                        </ModalOption>
                        <ModalOption onPress={resendSMS}>
                            <Text style={{color: PRIMARYCOLOR}}>Resend code</Text>
                        </ModalOption>
                    </ModalOptionContainer>
                </ModalView>
            </View>
            </TouchableWithoutFeedback>
           
            </Modal>
        </SafeAreaView>
    )
}
