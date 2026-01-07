from app.core.security import get_password_hash
from app.db.model_document import PromotionCode, User, UserPromotionCode, UserVideo, UserRole, UserGroup, UserAdminVideoAllowance
from app.schemas import schema_user
from app.schemas.schema_user import UserCreate
from app.config import settings
from app.aws_app_stack.subtiter_cognito import subtiter_cognito
import stripe
from stripe import InvalidRequestError
import os
import shutil
import traceback
from datetime import datetime
from pathlib import Path
# import time

from fastapi import APIRouter, Depends, HTTPException, Body, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from fastapi.responses import JSONResponse



# Set your secret key. Remember to switch to your live secret key in production.
# See your keys here: https://dashboard.stripe.com/apikeys
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')


router = APIRouter(
    prefix="/subscription",
    tags=["subscription"],
    responses={404: {"description": "Not found"}},
)


def get_stripe_product_id(product_id):
    if product_id == 'subtiter_level1':
        return os.getenv('subtiter_level1')
    elif product_id == 'subtiter_level2':
        return os.getenv('subtiter_level2')
    elif product_id == 'subtiter_level3':
        return os.getenv('subtiter_level3')
    else:
        raise HTTPException(status_code=400, detail="Invalid product ID")



def get_or_create_customer(email, name):
    """Get existing customer or create a new one"""
    customers = stripe.Customer.list(email=email, limit=1)
    if customers.data:
        return customers.data[0]
    else:
        return stripe.Customer.create(
            email=email,
            name=name
        )

def handle_monthly_payment(email, name, local_product_id):
    """Handle subscription payment for monthly plan"""
    customer = get_or_create_customer(email, name)

    # Delete all existing subscriptions for this customer
    existing_subscriptions = stripe.Subscription.list(
        customer=customer.id,
        status='all'  # Get all subscriptions regardless of status
    )
    for sub in existing_subscriptions.data:
        try:
            # Cancel the subscription immediately
            stripe.Subscription.delete(sub.id)
            print(f"Deleted subscription: {sub.id}")
        except Exception as e:
            print(f"Error deleting subscription {sub.id}: {e}")

    product_id = get_stripe_product_id(local_product_id)
    prices = stripe.Price.list(
        product=product_id
    )

    subscription = stripe.Subscription.create(
        customer=customer.id,
        items=[
            {
                'price': prices.data[0].id,
            },
        ],
        payment_behavior='default_incomplete',
        payment_settings={
            'payment_method_types': ['card'],
            'save_default_payment_method': 'on_subscription'
        },
        collection_method='charge_automatically',
        expand=['latest_invoice.payment_intent'],
    )

    # Get the invoice
    latest_invoice = subscription.latest_invoice
    if isinstance(latest_invoice, str):
        # If it's just an ID, fetch the full invoice with payment_intent expanded
        latest_invoice = stripe.Invoice.retrieve(latest_invoice, expand=['payment_intent'])

    print(f"Invoice status: {latest_invoice.status}")
    print(f"Invoice auto_advance: {latest_invoice.auto_advance if hasattr(latest_invoice, 'auto_advance') else 'N/A'}")

    # Get the payment_intent from the invoice
    payment_intent = None
    if hasattr(latest_invoice, 'payment_intent') and latest_invoice.payment_intent:
        payment_intent = latest_invoice.payment_intent
        if isinstance(payment_intent, str):
            # If it's just an ID, fetch the full payment intent
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent)

    # If no payment_intent exists, we need to handle it
    if not payment_intent:
        print(f"No payment_intent found, invoice status: {latest_invoice.status}")

        # Only try to finalize if status is 'draft'
        # 'open' means already finalized but unpaid
        if latest_invoice.status == 'draft':
            try:
                finalized_invoice = stripe.Invoice.finalize_invoice(
                    latest_invoice.id,
                    expand=['payment_intent']
                )
                print(f"Invoice finalized, new status: {finalized_invoice.status}")
                payment_intent = finalized_invoice.payment_intent
                if isinstance(payment_intent, str):
                    payment_intent = stripe.PaymentIntent.retrieve(payment_intent)
            except InvalidRequestError as e:
                print(f"Error finalizing invoice: {e}")
                raise
        elif latest_invoice.status == 'open':
            # Invoice is already finalized (open = finalized but unpaid)
            # Create a payment intent manually for this invoice
            print(f"Invoice is open (finalized but unpaid). Creating payment intent manually...")
            try:
                payment_intent = stripe.PaymentIntent.create(
                    amount=latest_invoice.amount_due,
                    currency=latest_invoice.currency,
                    customer=customer.id,
                    metadata={
                        'invoice_id': latest_invoice.id,
                        'subscription_id': subscription.id
                    },
                    automatic_payment_methods={'enabled': True}
                )
                print(f"Payment intent created: {payment_intent.id}")
            except InvalidRequestError as e:
                print(f"Error creating payment intent: {e}")
                raise

        if not payment_intent:
            raise HTTPException(status_code=400, detail=f"Payment intent not found on invoice. Invoice status: {latest_invoice.status}")

    return JSONResponse({
        'clientSecret': payment_intent.client_secret,
        'subscriptionId': subscription.id
    })












def register_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise Exception(detail="Email already registered")

        db_user = User(
            email=user.email,
            username=user.username,
            hashed_password=get_password_hash(user.password)
        )
        db.add(db_user)
        return schema_user.MessageResponse(message="User created successfully")
    except Exception as e:
        print(e)
        raise Exception(detail=str(e))




@router.post("/create-payment-intent",
             summary="Create payment intent",
             description="Create a payment intent for a given plan")
def create_payment_intent(planId: str = Body(...),
                          email: str = Body(...),
                          name: str = Body(...),
                          db: Session = Depends(get_db)):
    try:
        # register_user(UserCreate(email=email, username=str(uuid.uuid4()), password=str(uuid.uuid4())), db)

        print(f"planId: {planId}")
        print(f"email: {email}")
        print(f"name: {name}")
        result = handle_monthly_payment(email, name, planId)
        return result
    except Exception as e:
        print(e)
        traceback.print_exc()
        # db.rollback()
        return JSONResponse({'error': "An error occurred"}, status_code=550)



@router.post("/my-subscription-plan",
             summary="My subscription plan",
             description="Get my subscription plan",
             )
def my_subscription_plan(request: Request,
                         db: Session = Depends(get_db)):
    """Get my subscription plan"""
    try:
        user_id = request.state.user_id
        db_user = db.query(User.subscription_plan).filter(User.id == user_id).first()
        if db_user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return JSONResponse({'subscription_plan': db_user[0]})
    except Exception as e:
        print(e)
        traceback.print_exc()
        return JSONResponse({'error': "An error occurred"}, status_code=550)



@router.post("/cancel-subscription",
             summary="Cancel subscription",
             description="Cancel subscription",
             )
def cancel_subscription(request: Request,
                        db: Session = Depends(get_db)):
    """Cancel a user's subscription."""
    try:
        user_id = request.state.user_id
        db_user = db.query(User).filter(User.id == user_id).first()

        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        subscription_id = db_user.subscription_id
        if not subscription_id:
            raise HTTPException(status_code=400, detail="User has no active subscription.")

        # Cancel the subscription in Stripe.
        stripe.Subscription.delete(subscription_id)

        # Update the user's record in our database
        db_user.subscription_plan = "no_plan"
        db_user.subscription_id = None
        db_user.subscription_status = "canceled"
        db_user.subscription_expires_at = None
        db_user.subscription_updated_at = datetime.utcnow()
        db_user.subscription_config_json = None

        db.add(db_user)
        db.commit()

        return JSONResponse(content={"message": "Subscription canceled successfully."})

    except stripe.error.InvalidRequestError as e:
        if "No such subscription:" in str(e):
            # If Stripe says it doesn't exist, sync our database
            db_user.subscription_plan = "no_plan"
            db_user.subscription_id = None
            db_user.subscription_status = "canceled"
            db_user.subscription_expires_at = None
            db_user.subscription_updated_at = datetime.utcnow()
            db_user.subscription_config_json = None
            db.add(db_user)
            db.commit()
            return JSONResponse(content={"message": "Subscription not found on payment provider, user status synced."})
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        print(e)
        traceback.print_exc()
        return JSONResponse({'error': "An error occurred"}, status_code=500)



@router.post("/apply-promotion-code",
             summary="Apply promotion code",
             description="Apply promotion code",
             )
def apply_promotion_code(request: Request,
                       promotion_code: str = Body(...),
                       db: Session = Depends(get_db)):
    """Apply a promotion code to a user."""
    try:
        user_id = request.state.user_id
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check if user already has a promotion code
        existing_user_promo_code = db.query(UserPromotionCode).filter(UserPromotionCode.user_id == user_id).first()
        if existing_user_promo_code:
            raise HTTPException(status_code=451, detail="User already has an active promotion code.")

        promotion_code_str = promotion_code.strip().upper()
        db_promotion_code = db.query(PromotionCode).filter(PromotionCode.code == promotion_code_str).first()

        if not db_promotion_code or not db_promotion_code.is_active:
            raise HTTPException(status_code=404, detail="Promotion code not found or is not active")

        # Create a new UserPromotionCode entry
        new_user_promo_code = UserPromotionCode(
            user_id=user_id,
            code=db_promotion_code.code,
            video_allowance_in_seconds=db_promotion_code.video_allowance_in_seconds,
            video_count_allowance=db_promotion_code.video_count_allowance
        )
        db.add(new_user_promo_code)

        # Deactivate the promotion code after use
        db.delete(db_promotion_code)

        db.commit()

        return JSONResponse(content={"message": "Promotion code applied successfully."})
    except Exception as e:
        print(e)
        traceback.print_exc()
        return JSONResponse({'error': "An error occurred"}, status_code=500)



@router.post("/delete-account",
             summary="Delete account",
             description="Delete account",
             )
def delete_account(request: Request,
                   db: Session = Depends(get_db)):
    """Delete account - cancels subscription, deletes user warehouse directory, user_videos records, and user record."""
    try:
        user_id = request.state.user_id
        db_user = db.query(User).filter(User.id == user_id).first()

        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")



        # delete cognito user (using email as username, which is how users are registered in Cognito)
        try:
            subtiter_cognito.admin_delete_user(db_user.email)
            print(f"Deleted Cognito user: {db_user.email}")
        except Exception as e:
            # Log but don't fail - user may not exist in Cognito (e.g., social login, already deleted)
            print(f"Cognito user {db_user.email} deletion skipped: {e}")
        
        # 1. Cancel subscription in Stripe if exists
        subscription_id = db_user.subscription_id
        if subscription_id and subscription_id.strip() != "":
            try:
                stripe.Subscription.delete(subscription_id)
                print(f"Deleted Stripe subscription: {subscription_id}")
            except stripe.error.InvalidRequestError as e:
                if "No such subscription:" not in str(e):
                    print(f"Error deleting Stripe subscription {subscription_id}: {e}")

        # 2. Delete user directory in warehouse
        try:
            warehouse_dir = Path(settings.VIDEO_WAREHOUSE_ROOT_DIR) / str(user_id)
            if warehouse_dir.exists():
                shutil.rmtree(warehouse_dir)
                print(f"Deleted user warehouse directory: {warehouse_dir}")
        except Exception as e:
            print(f"Error deleting user warehouse directory: {e}")

        # 3. Delete records in user_videos table
        db.query(UserVideo).filter(UserVideo.user_id == user_id).delete()

        # 4. Delete records in related tables
        db.query(UserRole).filter(UserRole.user_id == user_id).delete()
        db.query(UserGroup).filter(UserGroup.user_id == user_id).delete()
        db.query(UserPromotionCode).filter(UserPromotionCode.user_id == user_id).delete()
        db.query(UserAdminVideoAllowance).filter(UserAdminVideoAllowance.user_id == user_id).delete()




        # 5. Delete the user record
        db.delete(db_user)



        db.commit()

        return JSONResponse(content={"message": "Account deleted successfully."})
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(e)
        traceback.print_exc()
        return JSONResponse({'error': "An error occurred"}, status_code=500)