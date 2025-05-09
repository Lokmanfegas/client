import { 
    View, 
    Text, 
    TouchableOpacity,  
    Image, 
    Animated,
    Modal,
    StyleSheet,
    Dimensions
  } from 'react-native';

  const {width, height} = Dimensions.get('window');

  const wp = (size) => (width / 100) * size;
  const hp = (size) => (height / 100) * size;
export default function Alert({showAlert, hideAlert , slideAnim}) {
    return (
        <Modal
        transparent={true}
        visible={showAlert}
        onRequestClose={hideAlert}
        animationType="none"
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={hideAlert}
        >
          <Animated.View 
            style={[
              styles.alertContainer,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Image source={require('../assets/valide.png')} style={styles.alertIcon} />
            <View style={styles.alertContent}>
               <Text style={styles.alertTitle}>Item added to Chart!</Text>
               <Text style={styles.alertText}>
                You can now go to your chart and
                check the selected items by checking your chart to validate your order
              </Text>
            </View>
            
            <TouchableOpacity 
              onPress={hideAlert}
              style={styles.alertButton1}
            >
              <Text style={styles.alertButtonText1}>go to chart</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={hideAlert}
              style={styles.alertButton}
            >
              <Text style={styles.alertButtonText}>Continue shopping</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>   

    );
    }


    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#fff',
          },
          content: {
            paddingBottom: hp('12%'),
          },
          header: {
            borderBottomLeftRadius: wp('40%'),
            borderBottomRightRadius: wp('40%'),
            backgroundColor: '#B02522',
            paddingVertical: hp('15%'),
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
          headerButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: wp('108%'),
            paddingHorizontal: wp('10%'),
            marginTop: hp('-10%'),
          },
          backButton: {
            marginLeft: wp('-10%'),
            marginTop:hp('-8%')
          },
          heartButton: {
            marginLeft: wp('-10%'),
            marginTop:hp('-8%'),
          },
          headerIcon: {
            width: wp('6%'),
            height: wp('6%'),
          },
          imageSection: {
            
            alignItems: 'center',
            marginTop: hp('-20%'),
            marginLeft:wp('-3%')
          },
          foodImage: {
            width: wp('70%'),
            height: hp('40%'),
            resizeMode: 'contain',
            marginLeft: wp('5%'),
          },
          foodTitle: {
            fontFamily: 'SF-Pro-Display-Bold',
            fontWeight: '700',
            fontSize: wp('8%'),
            color: '#082953',
            marginTop: hp('1%'),
            marginLeft: wp('5%'),
          },
          priceQuantityContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: hp('2%'),
            marginLeft: wp('10%'),
          },
          priceContainer: {
            borderRadius: wp('4%'),
            backgroundColor: '#F4F5F6',
            paddingHorizontal: wp('4%'),
            paddingVertical: hp('1%'),
            marginRight: wp('4%'),
          },
          quantityContainer: {
            flexDirection: 'row',
            borderRadius: wp('4%'),
            backgroundColor: '#F4F5F6',
            paddingHorizontal: wp('4%'),
            paddingVertical: hp('1%'),
            alignItems: 'center',
          },
          quantityText: {
            marginHorizontal: wp('2%'),
            fontSize: wp('4%'),
          },
          quantityIcon: {
            tintColor:'black',
            width: wp('3%'),
            height: wp('3%'),
          },
          cartContainer: {
            marginLeft: wp('10%'),
            backgroundColor: '#FFC01D',
            height: hp('6%'),
            width: wp('12%'),
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: wp('2%'),
          },
          cartIcon: {
            width: wp('6%'),
            height: wp('6%'),
          },
          section: {
            paddingHorizontal: wp('5%'),
            paddingVertical: hp('2%'),
          },
          sectionHeader: {
            fontSize: wp('5%'),
            fontWeight: 'bold',
            marginBottom: hp('1.5%'),
          },
          sectionTitle: {
            fontSize: wp('5%'),
            fontWeight: 'bold',
            color: '#9FA4AA',
            marginBottom: hp('1%'),
          },
          priceText:{
            marginTop:hp('0.7%'),
           color:'#437F40'
          },
          reviewsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            marginTop: hp('2%'),
          },
          reviewItem: {
            alignItems: 'center',
          },
          calorieItem: {
            alignItems: 'center',
          },
          ratingText: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFE9B2',
            borderRadius: wp('2%'),
            paddingHorizontal: wp('2%'),
            paddingVertical: hp('0.5%'),
            marginTop: hp('0.5%'),
          },
          NEWText: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#B02522',
            borderRadius: wp('2%'),
            paddingHorizontal: wp('2%'),
            paddingVertical: hp('0.5%'),
            marginTop: hp('0.5%'),
          },
          ratingIcon: {
            width: wp('3%'),
            height: wp('3%'),
            marginRight: wp('1%'),
          },
          calorieIcon: {
            width: wp('3%'),
            height: wp('3%'),
            marginRight: wp('1%'),
          },
          ratingValue: {
            color: '#FFC107',
            fontSize: wp('3%'),
          },
          calorieValue: {
            color: '#FFD747',
            fontSize: wp('3%'),
            fontFamily: 'Poppins-Medium',
            fontWeight: '500',
          },
          ingredientsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
          },
          ingredientItem: {
            fontSize: wp('4%'),
            color: '#9FA4AA',
            marginRight: wp('2%'),
            marginBottom: hp('0.5%'),
          },
          descriptionText: {
            color: '#9FA4AA',
            fontFamily: 'Poppins-Medium',
            fontWeight: '500',
            fontSize: wp('4%'),
            lineHeight: hp('2.5%'),
          },
          navBar: {
            height: hp('10%'),
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            borderTopWidth: 1,
            borderColor: '#eee',
            backgroundColor: '#F4F5F6',
            position: 'absolute',
            bottom: 0,
            width: wp('100%'),
            paddingHorizontal: wp('5%'),
          },
          navItem: {
            alignItems: 'center',
            width: wp('15%'),
          },
          navIcon: {
            width: wp('6%'),
            height: wp('6%'),
            marginBottom: hp('0.5%'),
          },
          navItemM: {
            backgroundColor: '#FFC01D',
            borderRadius: wp('50%'),
            width: wp('20%'),
            height: wp('20%'),
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: hp('-5%'),
          },
          navIconM: {
            width: wp('10%'),
            height: wp('10%'),
          },
          navText: {
            color: '#555',
            fontSize: wp('3%'),
          },
          modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          },
          alertContainer: {
            backgroundColor: 'white',
            borderTopLeftRadius: wp('5%'),
            borderTopRightRadius: wp('5%'),
            padding: wp('5%'),
            paddingBottom: hp('3%'),
            alignItems: 'center',
          },
          alertIcon: {
            width: wp('15%'),
            height: wp('15%'),
            marginBottom: hp('2%'),
          },
          alertContent: {
            marginBottom: hp('5%'),
            alignItems: 'center',
          },
          alertTitle: {
            fontSize: wp('6%'),
            fontWeight: 'bold',
            color: '#000',
            marginBottom: hp('1%'),
            textAlign: 'center',
          },
          alertText: {
            fontSize: wp('4%'),
            color: '#9FA4AA',
            textAlign: 'center',
            marginBottom: hp('2%'),
            lineHeight: hp('2.5%'),
          },
          alertButton1: {
            backgroundColor: '#134482',
            paddingVertical: hp('2%'),
            borderRadius: wp('3%'),
            width: wp('80%'),
            alignItems: 'center',
            marginBottom: hp('2%'),
          },
          alertButtonText1: {
            color: 'white',
            fontWeight: 'bold',
            fontSize: wp('5%'),
          },
          alertButton: {
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#fff',
            paddingVertical: hp('1.5%'),
            borderRadius: wp('3%'),
            width: wp('60%'),
            alignItems: 'center',
          },
          alertButtonText: {
            color: '#134482',
            fontWeight: 'bold',
            fontSize: wp('4%'),
          }
          })